import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { CreateBookDto, UpdateBookDto, FilterBookDto } from '../dto/book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) { }

  async create(createBookDto: CreateBookDto, currentUser?: any): Promise<Book> {
    const book = this.booksRepository.create(createBookDto);
    return await this.booksRepository.save(book);
  }

  async findAll(filterDto?: FilterBookDto): Promise<Book[]> {
    const queryBuilder = this.booksRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.genre', 'genre');

    if (filterDto?.genre_id) {
      queryBuilder.andWhere('book.genre_id = :genreId', { genreId: filterDto.genre_id });
    }

    if (filterDto?.available !== undefined) {
      if (filterDto.available) {
        queryBuilder.andWhere('book.available_copies > 0');
      } else {
        queryBuilder.andWhere('book.available_copies = 0');
      }
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['genre'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto, currentUser?: any): Promise<Book> {
    const book = await this.findOne(id);
    Object.assign(book, updateBookDto);
    return await this.booksRepository.save(book);
  }

  async remove(id: number, currentUser?: any): Promise<void> {
    const book = await this.findOne(id);
    await this.booksRepository.remove(book);
  }

  async updateAvailableCopies(id: number, change: number): Promise<void> {
    await this.booksRepository
      .createQueryBuilder()
      .update(Book)
      .set({ available_copies: () => `available_copies + ${change}` })
      .where('id = :id', { id })
      .execute();
  }
} 