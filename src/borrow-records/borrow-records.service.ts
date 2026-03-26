import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, Not, IsNull } from 'typeorm';
import { BorrowRecord } from '../entities/borrow-record.entity';
import { Book } from '../entities/book.entity';
import { Member } from '../entities/member.entity';
import { BorrowBookDto, ReturnBookDto } from '../dto/borrow-record.dto';
import { BooksService } from '../books/books.service';
import { MembersService } from '../members/members.service';

@Injectable()
export class BorrowRecordsService {
  constructor(
    @InjectRepository(BorrowRecord)
    private borrowRecordsRepository: Repository<BorrowRecord>,
    private booksService: BooksService,
    private membersService: MembersService,
  ) { }

  async borrowBook(borrowBookDto: BorrowBookDto): Promise<BorrowRecord> {
    // Verify book and member exist
    const book = await this.booksService.findOne(borrowBookDto.book_id);
    await this.membersService.findOne(borrowBookDto.member_id);

    // Check if book is available
    if (book.available_copies <= 0) {
      throw new BadRequestException('Book is not available for borrowing');
    }

    // Create borrow record
    const borrowRecord = this.borrowRecordsRepository.create({
      ...borrowBookDto,
      borrow_date: new Date(),
      due_date: new Date(borrowBookDto.due_date),
    });

    const savedRecord = await this.borrowRecordsRepository.save(borrowRecord);

    // Update available copies
    await this.booksService.updateAvailableCopies(borrowBookDto.book_id, -1);

    return savedRecord;
  }

  async returnBook(returnBookDto: ReturnBookDto): Promise<BorrowRecord> {
    const borrowRecord = await this.borrowRecordsRepository.findOne({
      where: { id: returnBookDto.borrow_record_id },
      relations: ['book'],
    });

    if (!borrowRecord) {
      throw new NotFoundException('Borrow record not found');
    }

    if (borrowRecord.return_date) {
      throw new BadRequestException('Book has already been returned');
    }

    // Update return date
    borrowRecord.return_date = new Date();
    const updatedRecord = await this.borrowRecordsRepository.save(borrowRecord);

    // Update available copies
    await this.booksService.updateAvailableCopies(borrowRecord.book_id, 1);

    return updatedRecord;
  }

  async getOverdueBooks(): Promise<BorrowRecord[]> {
    const today = new Date();

    return await this.borrowRecordsRepository.find({
      where: {
        due_date: LessThan(today),
        return_date: null,
      },
      relations: ['book', 'book.genre', 'member'],
    });
  }

  async getMostPopularGenres(): Promise<any[]> {
    return await this.borrowRecordsRepository
      .createQueryBuilder('borrowRecord')
      .leftJoin('borrowRecord.book', 'book')
      .leftJoin('book.genre', 'genre')
      .select('genre.name', 'genre_name')
      .addSelect('COUNT(*)', 'borrow_count')
      .groupBy('genre.id')
      .addGroupBy('genre.name')
      .orderBy('borrow_count', 'DESC')
      .getRawMany();
  }

  async getMostPopularBooks(): Promise<any[]> {
    return await this.borrowRecordsRepository
      .createQueryBuilder('borrowRecord')
      .leftJoin('borrowRecord.book', 'book')
      .select('book.id', 'book_id')
      .addSelect('book.title', 'book_title')
      .addSelect('COUNT(*)', 'borrow_count')
      .groupBy('book.id')
      .addGroupBy('book.title')
      .orderBy('borrow_count', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async findAll(): Promise<BorrowRecord[]> {
    return await this.borrowRecordsRepository.find({
      relations: ['book', 'book.genre', 'member'],
      order: { borrow_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<BorrowRecord> {
    const borrowRecord = await this.borrowRecordsRepository.findOne({
      where: { id },
      relations: ['book', 'book.genre', 'member'],
    });

    if (!borrowRecord) {
      throw new NotFoundException(`Borrow record with ID ${id} not found`);
    }

    return borrowRecord;
  }

  async getAnalyticsSummary(): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Total borrows this month
    const totalBorrowsThisMonth = await this.borrowRecordsRepository.count({
      where: {
        borrow_date: Between(startOfMonth, endOfMonth),
      },
    });

    // All returned records
    const returnedRecords = await this.borrowRecordsRepository.find({
      where: {
        return_date: Not(IsNull()),
      },
    });

    // Average borrow duration (in days)
    let averageBorrowDuration = 0;
    if (returnedRecords.length > 0) {
      const totalDuration = returnedRecords.reduce((sum, record) => {
        const borrowDate = new Date(record.borrow_date);
        const returnDate = new Date(record.return_date);
        const diff = (returnDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0);
      averageBorrowDuration = totalDuration / returnedRecords.length;
    }

    // Return rate = returned / total borrows
    const totalBorrows = await this.borrowRecordsRepository.count();
    const returnRate = totalBorrows > 0 ? (returnedRecords.length / totalBorrows) * 100 : 0;

    return {
      totalBorrowsThisMonth,
      averageBorrowDuration: Number(averageBorrowDuration.toFixed(1)),
      returnRate: Number(returnRate.toFixed(1)),
    };
  }
} 