import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
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

  async create(createStaffDto: CreateStaffDto, currentUser?: Staff): Promise<Staff> {
    // Role-based permission check
    if (currentUser && currentUser.role === 'admin') {
      // Admin can only create librarian role
      if (createStaffDto.role !== 'librarian') {
        throw new ForbiddenException('Admin can only create librarian staff members');
      }
    }
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
      select: ['id', 'username', 'email', 'role', 'password_hash', 'is_demo'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }

    return staff;
  }

  async findByUsername(username: string): Promise<Staff | null> {
    const normalizedUsername = username.trim().toLowerCase();
    return await this.staffRepository.createQueryBuilder('staff')
      .select(['staff.id', 'staff.username', 'staff.email', 'staff.role', 'staff.password_hash'])
      .where('LOWER(TRIM(staff.username)) = :username', { username: normalizedUsername })
      .getOne();
  }

  async findByEmail(email: string): Promise<Staff | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return await this.staffRepository.createQueryBuilder('staff')
      .select(['staff.id', 'staff.username', 'staff.email', 'staff.role', 'staff.password_hash', 'staff.is_demo'])
      .where('LOWER(TRIM(staff.email)) = :email', { email: normalizedEmail })
      .getOne();
  }

  async restoreDemoAccount(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const demoAccounts: Record<string, { username: string; role: string; is_demo: boolean }> = {
      'admin@library.com': { username: 'admin', role: 'admin', is_demo: true },
      'librarian@library.com': { username: 'librarian', role: 'librarian', is_demo: true },
    };

    const baseline = demoAccounts[normalizedEmail];
    if (!baseline) return;

    const staff = await this.staffRepository.findOne({ where: { email: normalizedEmail } });
    if (!staff) return;

    const hashedPassword = await bcrypt.hash('password123', 10);
    staff.username = baseline.username;
    staff.role = baseline.role;
    staff.is_demo = baseline.is_demo;
    staff.password_hash = hashedPassword;
    await this.staffRepository.save(staff);
  }

  async validateUser(email: string, password: string): Promise<Staff | null> {
    console.log('=== VALIDATE USER ===');
    console.log('Email:', email);
    console.log('Password length:', password?.length);

    const normalizedEmail = email.toLowerCase();
    const user = await this.findByEmail(normalizedEmail);
    console.log('User found:', user ? `Yes (ID: ${user.id})` : 'No');

    if (!user) {
      console.log('User not found in database');
      return null;
    }

    if (!user.password_hash && ['admin@library.com', 'librarian@library.com', 'superadmin@library.com'].includes(normalizedEmail)) {
      console.log('Default account found with missing password hash; restoring default password.');
      user.password_hash = await bcrypt.hash('password123', 10);
      await this.staffRepository.save(user);
    }

    if (!user.password_hash) {
      console.log('User has no password hash; cannot validate.');
      return null;
    }

    console.log('User password_hash exists:', !!user.password_hash);
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
      select: ['id', 'username', 'role', 'email', 'phone', 'is_demo', 'created_at'],
    });
  }

  async findAllDebug(): Promise<Staff[]> {
    return await this.staffRepository.find({
      select: ['id', 'username', 'role', 'email', 'password_hash'],
    });
  }

  async update(id: number, updateData: Partial<Staff> & { password?: string }, currentUser?: Staff): Promise<Staff> {
    const staff = await this.findOne(id);

    if (staff.is_demo) {
      throw new ForbiddenException('Demo accounts cannot be modified permanently');
    }

    // Role-based permission check - only applies if editing someone else
    if (currentUser && currentUser.id !== staff.id) {
      if (currentUser.role === 'admin') {
        // Admin can only edit librarians, not other admins/super-admins
        if (staff.role !== 'librarian') {
          throw new ForbiddenException('Admin can only edit librarian staff members');
        }
      }
    }

    const sanitizedData = { ...updateData } as Partial<Staff> & { password?: string };

    if ('password' in sanitizedData && sanitizedData.password) {
      sanitizedData.password_hash = await bcrypt.hash(
        sanitizedData.password,
        10,
      );
      delete sanitizedData.password;
    }

    delete sanitizedData.password;

    Object.assign(staff, sanitizedData);
    return await this.staffRepository.save(staff);
  }

  async updateProfile(currentUser: Staff, updateData: Partial<Staff> & { password?: string }): Promise<Staff> {
    // Demo accounts cannot update profile
    if (currentUser.is_demo) {
      throw new ForbiddenException('Demo accounts cannot modify their profile');
    }

    const safeData = { ...updateData } as Partial<Staff> & { password?: string };

    // Never allow role changes
    delete safeData.role;

    // Hash password if provided
    if ('password' in safeData && safeData.password) {
      safeData.password_hash = await bcrypt.hash(safeData.password, 10);
      delete safeData.password;
    }

    delete safeData.password;

    const staff = await this.findOne(currentUser.id);
    Object.assign(staff, safeData);
    return await this.staffRepository.save(staff);
  }

  async remove(id: number, currentUser?: Staff): Promise<void> {
    const staff = await this.findOne(id);

    // Protect demo accounts
    if (['admin@library.com', 'librarian@library.com', 'superadmin@library.com'].includes(staff.email)) {
      throw new ForbiddenException('Cannot delete demo accounts');
    }

    // Role-based permission check
    if (currentUser && currentUser.role === 'admin') {
      // Admin can only delete librarians, not other admins/super-admins
      if (staff.role !== 'librarian') {
        throw new ForbiddenException('Admin can only delete librarian staff members');
      }
    }

    await this.staffRepository.remove(staff);
  }
}
