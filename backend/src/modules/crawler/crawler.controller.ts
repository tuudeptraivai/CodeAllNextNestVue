import { Controller, Post, Query, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { ApiTags } from '@nestjs/swagger';

import { PermissionMeta } from '../user/decorators/permission.decorator';

@ApiTags('crawler')
@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('sync')
  @PermissionMeta({ name: 'Đồng bộ phim theo trang', module: 'Crawler', systemModule: 'BUSINESS' })
  async sync(@Query('pages') pages: number = 1) {
    // Run in background
    this.crawlerService.syncMovies(pages);
    return { message: `Sync started for ${pages} pages. Check logs for progress.` };
  }

  @Post('sync-movie')
  @PermissionMeta({ name: 'Đồng bộ chi tiết phim', module: 'Crawler', systemModule: 'BUSINESS' })
  async syncMovie(@Query('slug') slug: string) {
    await this.crawlerService.syncMovieDetails(slug);
    return { message: `Sync started for movie: ${slug}` };
  }

  @Post('sync-genres')
  @PermissionMeta({ name: 'Đồng bộ thể loại', module: 'Crawler', systemModule: 'BUSINESS' })
  async syncGenres() {
    return this.crawlerService.syncGenres();
  }

  @Get('logs')
  @PermissionMeta({ name: 'Xem nhật ký Crawler', module: 'Crawler', systemModule: 'BUSINESS' })
  async getLogs() {
    return this.crawlerService.getLogs();
  }
}
