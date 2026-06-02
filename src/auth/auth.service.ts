import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAuthService } from './jwt.service';
import { StaffService } from '../staff/staff.service';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { Staff } from '../entities/staff.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly staffService: StaffService,
    private readonly jwtAuthService: JwtAuthService,
  ) { }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: Partial<Staff> }> {
    console.log('=== AUTH SERVICE LOGIN ===');
    console.log('Login attempt for email:', loginDto.email);

    const user = await this.staffService.validateUser(loginDto.email, loginDto.password);

    console.log('User found:', user ? `Yes (${user.username})` : 'No');

    if (!user) {
      console.log('Invalid credentials for email:', loginDto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('Login successful for user:', user.username);
    const access_token = await this.jwtAuthService.generateToken(user);

    // Return user without password_hash
    const { password_hash, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async signup(signupDto: SignupDto): Promise<{ access_token: string; user: Partial<Staff> }> {
    const user = await this.staffService.create(signupDto);
    const access_token = await this.jwtAuthService.generateToken(user);

    // Return user without password_hash
    const { password_hash, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async validateUser(id: number): Promise<Staff> {
    return await this.staffService.findOne(id);
  }
} 