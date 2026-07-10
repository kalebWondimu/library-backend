import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { GenresService } from './genres.service';
import { Genre } from '../entities/genre.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateGenreDto } from './dto/create-genre.dto';

@ApiTags('genres')
@Controller('genres')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GenresController {
  constructor(private readonly genresService: GenresService) { }

  @Post()
  @Roles('admin', 'super-admin')
  @ApiOperation({ summary: 'Create a new genre' })
  @ApiResponse({ status: 201, description: 'Genre created successfully', type: Genre })
  create(@Body() createGenreDto: CreateGenreDto): Promise<Genre> {
    return this.genresService.create(createGenreDto.name);
  }

  @Get()
  @ApiOperation({ summary: 'Get all genres' })
  @ApiResponse({ status: 200, description: 'List of genres', type: [Genre] })
  findAll(): Promise<Genre[]> {
    return this.genresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a genre by ID' })
  @ApiResponse({ status: 200, description: 'Genre found', type: Genre })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  @ApiParam({ name: 'id', description: 'Genre ID' })
  findOne(@Param('id') id: string): Promise<Genre> {
    return this.genresService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'super-admin')
  @ApiOperation({ summary: 'Update a genre' })
  @ApiResponse({ status: 200, description: 'Genre updated successfully', type: Genre })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  @ApiParam({ name: 'id', description: 'Genre ID' })
  update(@Param('id') id: string, @Body('name') name: string): Promise<Genre> {
    return this.genresService.update(+id, name);
  }

  @Delete(':id')
  @Roles('admin', 'super-admin')
  @ApiOperation({ summary: 'Delete a genre' })
  @ApiResponse({ status: 200, description: 'Genre deleted successfully' })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  @ApiParam({ name: 'id', description: 'Genre ID' })
  remove(@Param('id') id: string): Promise<void> {
    return this.genresService.remove(+id);
  }
} 