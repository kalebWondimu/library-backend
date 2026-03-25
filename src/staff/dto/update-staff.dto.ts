import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, MinLength, IsEnum } from 'class-validator';

export class UpdateStaffDto {
  @ApiPropertyOptional({ description: 'Username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Password' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ description: 'User role', enum: ['admin', 'librarian'] })
  @IsOptional()
  @IsEnum(['admin', 'librarian'])
  role?: 'admin' | 'librarian';
} 