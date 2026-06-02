import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { StaffService } from '../staff/staff.service';
import { Staff } from '../entities/staff.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly staffService: StaffService,
  ) { }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    console.log('=== AUTH CONTROLLER LOGIN CALLED ===');
    console.log('Email:', loginDto.email);
    console.log('Password length:', loginDto.password?.length);
    try {
      const result = await this.authService.login(loginDto);
      console.log('Login successful for:', loginDto.email);
      return result;
    } catch (error) {
      console.log('Login failed:', error.message);
      throw error;
    }
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new staff member' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('create-admin')
  @ApiOperation({ summary: 'Create admin user for testing' })
  @ApiResponse({ status: 201, description: 'Admin user created successfully' })
  // async createAdmin() {
  //   const adminData = {
  //     username: 'admin',
  //     email: 'admin@library.com',
  //     password: 'admin123',
  //     role: 'admin' as const,
  //   };

  //   try {
  //     const user = await this.staffService.create(adminData);
  //     return { message: 'Admin user created successfully', user: { id: user.id, username: user.username, email: user.email, role: user.role } };
  //   } catch (error) {
  //     if (error.message.includes('already exists')) {
  //       return { message: 'Admin user already exists' };
  //     }
  //     throw error;
  //   }
  // }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile', type: Staff })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (for debugging)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getUsers() {
    const users = await this.staffService.findAll();
    return { users };
  }
} 