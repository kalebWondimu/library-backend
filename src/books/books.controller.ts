import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto, FilterBookDto } from '../dto/book.dto';
import { Book } from '../entities/book.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('books')
@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  @Post()
  @Roles('admin', 'librarian', 'super-admin')
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: 201, description: 'Book created successfully', type: Book })
  create(@Request() req: any, @Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.create(createBookDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books with optional filtering' })
  @ApiResponse({ status: 200, description: 'List of books', type: [Book] })
  @ApiQuery({ name: 'genre_id', required: false, description: 'Filter by genre ID' })
  @ApiQuery({ name: 'available', required: false, description: 'Filter by availability' })
  findAll(@Query() filterDto?: FilterBookDto): Promise<Book[]> {
    return this.booksService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiResponse({ status: 200, description: 'Book found', type: Book })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  findOne(@Param('id') id: string): Promise<Book> {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'librarian', 'super-admin')
  @ApiOperation({ summary: 'Update a book' })
  @ApiResponse({ status: 200, description: 'Book updated successfully', type: Book })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  update(@Request() req: any, @Param('id') id: string, @Body() updateBookDto: UpdateBookDto): Promise<Book> {
    return this.booksService.update(+id, updateBookDto, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'super-admin')
  @ApiOperation({ summary: 'Delete a book' })
  @ApiResponse({ status: 200, description: 'Book deleted successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  remove(@Request() req: any, @Param('id') id: string): Promise<void> {
    return this.booksService.remove(+id, req.user);
  }
} 