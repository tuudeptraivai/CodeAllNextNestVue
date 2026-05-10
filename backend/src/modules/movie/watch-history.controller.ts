import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionMeta } from '../user/decorators/permission.decorator';

@ApiTags('watch-history')
@ApiBearerAuth()
@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post('update')
  @PermissionMeta({ name: 'Cập nhật tiến trình xem phim', module: 'Lịch sử xem', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Update watch progress for an episode' })
  async updateProgress(@Request() req, @Body() data: {
    filmId: string;
    episodeSlug: string;
    serverName: string;
    duration: number;
    totalDuration: number;
  }) {
    return this.watchHistoryService.updateProgress(
      req.user.userId,
      data.filmId,
      data.episodeSlug,
      data.serverName,
      data.duration,
      data.totalDuration,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('film/:filmId')
  @PermissionMeta({ name: 'Xem lịch sử xem phim (theo phim)', module: 'Lịch sử xem', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get watch history for all episodes of a film' })
  async getFilmHistory(@Request() req, @Param('filmId') filmId: string) {
    return this.watchHistoryService.getFilmHistory(req.user.userId, filmId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('film/:filmId/episode/:episodeSlug')
  @PermissionMeta({ name: 'Xem tiến trình tập phim', module: 'Lịch sử xem', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get watch progress for a specific episode' })
  async getEpisodeProgress(
    @Request() req,
    @Param('filmId') filmId: string,
    @Param('episodeSlug') episodeSlug: string,
  ) {
    return this.watchHistoryService.getProgress(req.user.userId, filmId, episodeSlug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recent')
  @PermissionMeta({ name: 'Xem lịch sử xem gần đây', module: 'Lịch sử xem', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get recently watched films' })
  async getRecentHistory(@Request() req) {
    return this.watchHistoryService.getRecentHistory(req.user.userId);
  }
}
