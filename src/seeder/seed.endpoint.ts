import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeederService } from './seeder.service';

@ApiTags('seeder')
@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post('seed')
  @ApiOperation({ summary: 'Manually trigger database seeding (for fresh databases)' })
  @ApiResponse({ status: 200, description: 'Database seeded successfully' })
  @ApiResponse({ status: 500, description: 'Seeding failed' })
  async triggerSeed() {
    try {
      await this.seederService.seed();
      return {
        message: 'Database seeded successfully',
        accounts: [
          { email: 'superadmin@library.com', password: 'password123', role: 'super-admin' },
          { email: 'admin@library.com', password: 'password123', role: 'admin' },
          { email: 'librarian@library.com', password: 'password123', role: 'librarian' },
        ],
      };
    } catch (error) {
      return {
        error: 'Seeding failed',
        message: error.message,
      };
    }
  }
}
