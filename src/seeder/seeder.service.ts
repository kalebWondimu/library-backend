import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from '../entities/genre.entity';
import { Book } from '../entities/book.entity';
import { Member } from '../entities/member.entity';
import { Staff } from '../entities/staff.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) { }

  private async ensureStaffColumns() {
    // In production with synchronize=false, this ensures phone and is_demo exist on legacy DB tables
    try {
      await this.staffRepository.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone VARCHAR(255);`);
      await this.staffRepository.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;`);
    } catch (error) {
      if (error.code === '42P01') {
        console.log('Staff table not yet created; skipping staff column checks.');
      } else {
        throw error;
      }
    }
  }

  private async ensureDefaultStaffUser(email: string, username: string, role: string, isDemo = false) {
    const user = await this.staffRepository.findOne({ where: { email } });
    const hashedPassword = await bcrypt.hash('password123', 10);

    if (!user) {
      const created = this.staffRepository.create({
        username,
        email,
        password_hash: hashedPassword,
        role,
        is_demo: isDemo,
      });
      await this.staffRepository.save(created);
      console.log(`Default ${role} user created: ${email} / password123`);
      return created;
    }

    if (!user.password_hash || user.is_demo !== isDemo || user.username !== username || user.role !== role) {
      user.password_hash = hashedPassword;
      user.username = username;
      user.role = role;
      user.is_demo = isDemo;
      await this.staffRepository.save(user);
      console.log(`Default ${role} user restored for existing user: ${email}`);
    }

    return user;
  }

  async seed() {
    await this.ensureStaffColumns();

    // ---------- Seed genres ----------
    const genres = [
      'Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery',
      'Romance', 'Biography', 'History', 'Science', 'Technology', 'Philosophy'
    ];

    const createdGenres = [];
    for (const name of genres) {
      let genre = await this.genreRepository.findOne({ where: { name } });
      if (!genre) {
        genre = this.genreRepository.create({ name });
        genre = await this.genreRepository.save(genre);
      }
      createdGenres.push(genre);
    }

    // ---------- Seed books ----------
    const sampleBooks = [
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', published_year: 1925, available_copies: 3, genre_id: createdGenres[0].id },
      { title: '1984', author: 'George Orwell', published_year: 1949, available_copies: 2, genre_id: createdGenres[2].id },
      { title: 'Pride and Prejudice', author: 'Jane Austen', published_year: 1813, available_copies: 4, genre_id: createdGenres[4].id },
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', published_year: 1937, available_copies: 2, genre_id: createdGenres[0].id },
      { title: 'A Brief History of Time', author: 'Stephen Hawking', published_year: 1988, available_copies: 1, genre_id: createdGenres[7].id },
    ];

    for (const bookData of sampleBooks) {
      let book = await this.bookRepository.findOne({ where: { title: bookData.title, author: bookData.author } });
      if (!book) {
        book = this.bookRepository.create(bookData);
        await this.bookRepository.save(book);
      }
    }

    // ---------- Seed members ----------
    const sampleMembers = [
      { name: 'John Doe', email: 'john.doe@example.com', phone: '555-0101', join_date: new Date('2023-01-15') },
      { name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-0102', join_date: new Date('2023-02-20') },
      { name: 'Bob Johnson', email: 'bob.johnson@example.com', phone: '555-0103', join_date: new Date('2023-03-10') },
    ];

    for (const memberData of sampleMembers) {
      let member = await this.memberRepository.findOne({ where: { email: memberData.email } });
      if (!member) {
        member = this.memberRepository.create(memberData);
        await this.memberRepository.save(member);
      }
    }

    // ---------- Seed super admin ----------
    await this.ensureDefaultStaffUser('superadmin@library.com', 'superadmin', 'super-admin', false);

    // ---------- Seed admin demo ----------
    await this.ensureDefaultStaffUser('admin@library.com', 'admin', 'admin', true);

    // ---------- Seed librarian demo ----------
    await this.ensureDefaultStaffUser('librarian@library.com', 'librarian', 'librarian', true);

    console.log('Database seeded successfully!');
  }

  async onModuleInit() {
    // Ensure schema compatibility for phone field in staff table
    await this.ensureStaffColumns();

    const shouldSeed = process.env.NODE_ENV !== 'production' ||
      process.env.SEED_DATABASE?.toLowerCase() === 'true';

    console.log('Seeder init:', {
      NODE_ENV: process.env.NODE_ENV,
      SEED_DATABASE: process.env.SEED_DATABASE,
      shouldSeed,
    });

    // Seed sample data automatically in development or when explicitly enabled in production.
    if (shouldSeed) {
      try {
        await this.seed();
      } catch (error) {
        console.error('Seeding failed:', error.message);
        // Don't crash the app if seeding fails; just log the error
      }
    }
  }
}
