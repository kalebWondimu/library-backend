import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto } from '../dto/member.dto';
import { Member } from '../entities/member.entity';
import { BorrowRecord } from '../entities/borrow-record.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('members')
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) { }

  @Post()
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Create a new member' })
  @ApiResponse({ status: 201, description: 'Member created successfully', type: Member })
  create(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all members' })
  @ApiResponse({ status: 200, description: 'List of members', type: [Member] })
  findAll(): Promise<Member[]> {
    return this.membersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a member by ID' })
  @ApiResponse({ status: 200, description: 'Member found', type: Member })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  findOne(@Param('id') id: string): Promise<Member> {
    return this.membersService.findOne(+id);
  }

  @Get(':id/borrowing-history')
  @ApiOperation({ summary: 'Get member borrowing history' })
  @ApiResponse({ status: 200, description: 'Borrowing history', type: [BorrowRecord] })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  getBorrowingHistory(@Param('id') id: string): Promise<BorrowRecord[]> {
    return this.membersService.getBorrowingHistory(+id);
  }

  @Get('reports/activity')
  @ApiOperation({ summary: 'Get member activity report' })
  @ApiResponse({ status: 200, description: 'Member activity list', type: [Object] })
  getMemberActivity() {
    return this.membersService.getMemberActivity();
  }

  @Patch(':id')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Update a member' })
  @ApiResponse({ status: 200, description: 'Member updated successfully', type: Member })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto): Promise<Member> {
    return this.membersService.update(+id, updateMemberDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a member' })
  @ApiResponse({ status: 200, description: 'Member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  remove(@Param('id') id: string): Promise<void> {
    return this.membersService.remove(+id);
  }
} 