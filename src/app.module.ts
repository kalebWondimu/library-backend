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

// When running tests, prefer an in-memory Sqlite DB to avoid external dependencies,
// but allow opting into the real DB for live integration runs by setting USE_REAL_DB=true.
const isTestEnv = process.env.NODE_ENV === 'test';
const useRealDb = process.env.USE_REAL_DB === 'true';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      // Use sqlite in-memory only when running tests AND not explicitly requesting the real DB
      isTestEnv && !useRealDb
        ? {
          type: 'sqlite',
          database: ':memory:',
          entities: [Book, Member, BorrowRecord, Genre, Staff],
          synchronize: true,
        }
        : {
          type: 'postgres',
          url: databaseUrl,
          ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
          entities: [Book, Member, BorrowRecord, Genre, Staff],
          // Enable synchronize for fresh databases or when explicitly seeding
          synchronize: process.env.NODE_ENV !== 'production' || process.env.SEED_DATABASE === 'true',
        },
    ),
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
