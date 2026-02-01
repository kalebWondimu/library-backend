import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const member = this.membersRepository.create({
      ...createMemberDto,
      join_date: new Date(createMemberDto.join_date),
    });
    return this.membersRepository.save(member);
  }

  // ✅ NOW returns members WITH active borrow count
  async findAll() {
    const members = await this.membersRepository.find();

    return Promise.all(
      members.map(async (member) => {
        const activeBorrows = await this.borrowRecordsRepository.count({
          where: {
            member_id: member.id,
            return_date: null,
          },
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

  async update(id: number, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id);
    Object.assign(member, updateMemberDto);
    return this.membersRepository.save(member);
  }

  // ✅ BLOCK delete if active borrows exist
  async remove(id: number): Promise<void> {
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
}
