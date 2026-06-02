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

const databaseUrl = process.env.DATABASE_URL || (() => {
  if (
    process.env.POSTGRES_HOST &&
    process.env.POSTGRES_USER &&
    process.env.POSTGRES_PASSWORD &&
    process.env.POSTGRES_DATABASE
  ) {
    const host = process.env.POSTGRES_HOST;
    const port = process.env.POSTGRES_PORT || '5432';
    const user = encodeURIComponent(process.env.POSTGRES_USER);
    const pass = encodeURIComponent(process.env.POSTGRES_PASSWORD);
    const db = process.env.POSTGRES_DATABASE;
    const sslQuery = process.env.DATABASE_SSL === 'true' ? '?sslmode=require' : '';
    return `postgresql://${user}:${pass}@${host}:${port}/${db}${sslQuery}`;
  }
  return undefined;
})();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
      entities: [Book, Member, BorrowRecord, Genre, Staff],
      // Enable synchronize for fresh databases or when explicitly seeding
      synchronize: process.env.NODE_ENV !== 'production' || process.env.SEED_DATABASE === 'true',
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
export class AppModule { }
