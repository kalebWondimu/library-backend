import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { MembersModule } from './members/members.module';
import { BorrowRecordsModule } from './borrow-records/borrow-records.module';
import { GenresModule } from './genres/genres.module';
import { SeederModule } from './seeder/seeder.module';
import { AuthModule } from './auth/auth.module';
import { StaffModule } from './staff/staff.module';
import { Book } from './entities/book.entity';
import { Member } from './entities/member.entity';
import { BorrowRecord } from './entities/borrow-record.entity';
import { Genre } from './entities/genre.entity';
import { Staff } from './entities/staff.entity';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,          // Use DATABASE_URL from .env
      ssl: process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }      // Required for Neon
        : false,
      entities: [Book, Member, BorrowRecord, Genre, Staff],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    BooksModule,
    MembersModule,
    BorrowRecordsModule,
    GenresModule,
    SeederModule,
    AuthModule,
    StaffModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
