import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'john_doe', description: 'Username' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'john.doe@library.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '555-123-4567', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'librarian', description: 'User role', enum: ['admin', 'librarian'] })
  @IsEnum(['admin', 'librarian'])
  role: 'admin' | 'librarian';
} 