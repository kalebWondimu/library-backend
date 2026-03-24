import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) { }

  async create(createStaffDto: CreateStaffDto): Promise<Staff> {
    // Check if username already exists
    const existingUser = await this.staffRepository.findOne({
      where: { username: createStaffDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.staffRepository.findOne({
      where: { email: createStaffDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createStaffDto.password, 10);

    // Create new staff member
    const staff = this.staffRepository.create({
      username: createStaffDto.username,
      email: createStaffDto.email,
      phone: createStaffDto.phone,
      password_hash: hashedPassword,
      role: createStaffDto.role,
    });

    return await this.staffRepository.save(staff);
  }

  async findOne(id: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }

    return staff;
  }

  async findByUsername(username: string): Promise<Staff | null> {
    return await this.staffRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<Staff | null> {
    return await this.staffRepository.findOne({
      where: { email },
    });
  }

  async validateUser(email: string, password: string): Promise<Staff | null> {
    console.log('Validating user:', email);

    const user = await this.findByEmail(email);
    console.log('User found in database:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found in database');
      return null;
    }

    console.log('Comparing passwords...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isPasswordValid);

    if (user && isPasswordValid) {
      console.log('User validation successful');
      return user;
    }

    console.log('User validation failed');
    return null;
  }

  async findAll(): Promise<Staff[]> {
    return await this.staffRepository.find({
      select: ['id', 'username', 'role', 'email', 'phone'], // Don't include password_hash
    });
  }

  async update(id: number, updateData: Partial<Staff>): Promise<Staff> {
    const staff = await this.findOne(id);

    if (updateData.password_hash) {
      updateData.password_hash = await bcrypt.hash(
        updateData.password_hash,
        10,
      );
    }

    Object.assign(staff, updateData);
    return await this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
  }
}
