import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionMeta } from '../user/decorators/permission.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  @PermissionMeta({ name: 'Xem thống kê dashboard', module: 'Dashboard', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getStats() {
    return this.dashboardService.getStats();
  }
}
