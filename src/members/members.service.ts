import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNull } from 'typeorm';
import { Member } from '../entities/member.entity';
import { BorrowRecord } from '../entities/borrow-record.entity';
import { CreateMemberDto, UpdateMemberDto } from '../dto/member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
    @InjectRepository(BorrowRecord)
    private borrowRecordsRepository: Repository<BorrowRecord>,
  ) { }

  async create(createMemberDto: CreateMemberDto, currentUser?: any): Promise<Member> {
    const member = this.membersRepository.create({
      ...createMemberDto,
      join_date: new Date(createMemberDto.join_date),
    });

    // Demo accounts: do not persist changes permanently
    if (currentUser?.is_demo) {
      // Return a transient member object (no DB save)
      return { ...member, id: -(Date.now()) } as Member;
    }

    return this.membersRepository.save(member);
  }


  async findAll() {
    const members = await this.membersRepository.find();

    return Promise.all(
      members.map(async (member) => {
        const activeBorrows = await this.borrowRecordsRepository.count({
          where: {
            member_id: member.id,
            return_date: IsNull(),
          }
        });

        return {
          ...member,
          activeBorrows,
        };
      }),
    );
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.membersRepository.findOne({ where: { id } });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return member;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto, currentUser?: any): Promise<Member> {
    const member = await this.findOne(id);
    Object.assign(member, updateMemberDto);

    if (currentUser?.is_demo) {
      // Return updated object without persisting
      return member;
    }

    return this.membersRepository.save(member);
  }

  // ✅ BLOCK delete if active borrows exist
  async remove(id: number, currentUser?: any): Promise<void> {
    const activeBorrows = await this.borrowRecordsRepository.count({
      where: {
        member_id: id,
        return_date: null,
      },
    });

    if (activeBorrows > 0) {
      throw new BadRequestException(
        'Cannot delete member with active borrowed books',
      );
    }

    const member = await this.findOne(id);

    if (currentUser?.is_demo) {
      // Simulate deletion for demo users without persisting
      return;
    }

    await this.membersRepository.remove(member);
  }

  async getBorrowingHistory(memberId: number): Promise<BorrowRecord[]> {
    await this.findOne(memberId);

    return this.borrowRecordsRepository.find({
      where: { member_id: memberId },
      relations: ['book', 'book.genre'],
      order: { borrow_date: 'DESC' },
    });
  }

  async getMemberActivity(): Promise<any> {
    const members = await this.membersRepository.find();

    const memberActivity = await Promise.all(
      members.map(async (member) => {
        const borrowRecords = await this.borrowRecordsRepository.find({
          where: { member_id: member.id },
          order: { borrow_date: 'DESC' },
        });

        const totalBorrows = borrowRecords.length;
        const outstandingBorrows = borrowRecords.filter(
          (b) => !b.return_date,
        ).length;

        // Get the most recent borrow date for filtering
        const mostRecentBorrowDate =
          borrowRecords.length > 0 ? borrowRecords[0].borrow_date : null;

        return {
          member_id: member.id,
          name: member.name,
          totalBorrows,
          outstandingBorrows,
          borrow_date: mostRecentBorrowDate,
          created_at: member.join_date || member.created_at,
        };
      }),
    );

    // return top 10 active members by borrow count
    return memberActivity
      .sort((a, b) => b.totalBorrows - a.totalBorrows)
      .slice(0, 10);
  }
}

