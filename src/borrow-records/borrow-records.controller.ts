import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BorrowRecordsService } from './borrow-records.service';
import { BorrowBookDto, ReturnBookDto } from '../dto/borrow-record.dto';
import { BorrowRecord } from '../entities/borrow-record.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('borrow-records')
@Controller('borrow-records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BorrowRecordsController {
  constructor(private readonly borrowRecordsService: BorrowRecordsService) { }

  @Post('borrow')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Borrow a book' })
  @ApiResponse({ status: 201, description: 'Book borrowed successfully', type: BorrowRecord })
  borrowBook(@Body() borrowBookDto: BorrowBookDto): Promise<BorrowRecord> {
    return this.borrowRecordsService.borrowBook(borrowBookDto);
  }

  @Post('return')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Return a book' })
  @ApiResponse({ status: 200, description: 'Book returned successfully', type: BorrowRecord })
  returnBook(@Body() returnBookDto: ReturnBookDto): Promise<BorrowRecord> {
    return this.borrowRecordsService.returnBook(returnBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all borrow records' })
  @ApiResponse({ status: 200, description: 'List of borrow records', type: [BorrowRecord] })
  findAll(): Promise<BorrowRecord[]> {
    return this.borrowRecordsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a borrow record by ID' })
  @ApiResponse({ status: 200, description: 'Borrow record found', type: BorrowRecord })
  @ApiResponse({ status: 404, description: 'Borrow record not found' })
  @ApiParam({ name: 'id', description: 'Borrow record ID' })
  findOne(@Param('id') id: string): Promise<BorrowRecord> {
    return this.borrowRecordsService.findOne(+id);
  }

  @Get('reports/overdue')
  @ApiOperation({ summary: 'Get overdue books report' })
  @ApiResponse({ status: 200, description: 'Overdue books list', type: [BorrowRecord] })
  getOverdueBooks(): Promise<BorrowRecord[]> {
    return this.borrowRecordsService.getOverdueBooks();
  }

  @Get('reports/popular-genres')
  @ApiOperation({ summary: 'Get most popular genres report' })
  @ApiResponse({ status: 200, description: 'Most popular genres with borrow counts' })
  getMostPopularGenres(): Promise<any[]> {
    return this.borrowRecordsService.getMostPopularGenres();
  }

  @Get('reports/popular-books')
  @ApiOperation({ summary: 'Get most popular books report' })
  @ApiResponse({ status: 200, description: 'Most popular books with borrow counts' })
  getMostPopularBooks(): Promise<any[]> {
    return this.borrowRecordsService.getMostPopularBooks();
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Get analytics summary (total borrows, avg duration, return rate)' })
  @ApiResponse({ status: 200, description: 'Analytics summary' })
  getAnalyticsSummary() {
    return this.borrowRecordsService.getAnalyticsSummary();
  }
} 