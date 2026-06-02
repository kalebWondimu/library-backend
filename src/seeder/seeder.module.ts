import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { SeederController } from './seed.endpoint';
import { Genre } from '../entities/genre.entity';
import { Book } from '../entities/book.entity';
import { Member } from '../entities/member.entity';
import { Staff } from '../entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Genre, Book, Member, Staff])],
  providers: [SeederService],
  controllers: [SeederController],
  exports: [SeederService],
})
export class SeederModule {} 