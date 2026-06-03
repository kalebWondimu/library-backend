import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StaffService } from '../staff/staff.service';

@ApiTags('debug')
@Controller('debug')
export class AuthDebugController {
  constructor(private readonly staffService: StaffService) { }

  @Get('users')
  @ApiOperation({ summary: 'Get all staff users (debug only)' })
  async getAllUsers() {
    try {
      const users = await this.staffService.findAllDebug();
      return {
        success: true,
        count: users.length,
        users: users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          password_hash_exists: !!u.password_hash,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('validate-password')
  @ApiOperation({ summary: 'Test password validation (debug only)' })
  async testPasswordValidation() {
    try {
      const testEmail = 'admin@library.com';
      const testPassword = 'password123';

      const user = await this.staffService.validateUser(testEmail, testPassword);

      return {
        email: testEmail,
        password: testPassword,
        user_found: !!user,
        user_data: user ? {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        } : null,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
}
