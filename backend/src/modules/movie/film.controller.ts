import { Controller, Get, Param, Query, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { FilmService } from './film.service';
import { TypeService } from './type.service';
import { ActorService } from './actor.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionMeta } from '../user/decorators/permission.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('films')
@Controller('films')
export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  @Public()
  @Get()
  @PermissionMeta({ name: 'Xem danh sách phim', module: 'Quản lý phim', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get all films with pagination and filters' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sort') sort: string = 'newest',
    @Query('type') type?: string,
    @Query('country') country?: string,
    @Query('category') category?: string,
    @Query('isSeries') isSeries?: boolean,
    @Query('year') year?: number,
    @Query('releaseYear') releaseYear?: number,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('actors') actors?: string,
  ) {
    console.log(`[GET /films] sort=${sort}, category=${category}, page=${page}, keyword=${keyword}`);
    const filter: any = {};

    if (actors) {
      filter.actors = actors;
    }
    
    // Filter by country slug
    if (country) {
      filter['country.slug'] = country;
    }
    
    // Filter by category slug (can be passed via type or category param)
    const categorySlug = category || type;
    if (categorySlug && categorySlug !== country) {
      filter['category.slug'] = categorySlug;
    }

    if (status) filter.status = status;
    
    if (isSeries !== undefined) {
      const isSeriesBool = String(isSeries) === 'true';
      if (isSeriesBool) {
        filter.episode_total = { $ne: '1' };
      } else {
        filter.episode_total = '1';
      }
    }
    
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { origin_name: { $regex: keyword, $options: 'i' } },
      ];
    }
    
    const yearToFilter = releaseYear || year;
    if (yearToFilter) filter.releaseYear = yearToFilter;

    return this.filmService.findAll(page, limit, filter, sort);
  }


  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search films' })
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.filmService.search(query, page, limit);
  }

  @Public()
  @Get('top-liked')
  @ApiOperation({ summary: 'Get top liked films' })
  async findTopLiked(@Query('limit') limit: number = 10) {
    return this.filmService.findTopLiked(limit);
  }

  @Public()
  @Get('top-viewed')
  @ApiOperation({ summary: 'Get top viewed films' })
  async findTopViews(@Query('limit') limit: number = 10) {
    return this.filmService.findTopViews(limit);
  }

  @Public()
  @Get('top-series')
  @ApiOperation({ summary: 'Get top 10 series films' })
  async findTopSeries(@Query('limit') limit: number = 10) {
    return this.filmService.findTopSeries(limit);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get film by slug' })
  async findOne(@Param('slug') slug: string) {
    return this.filmService.findOneBySlug(slug);
  }

  @Public()
  @Post(':id/view')
  @ApiOperation({ summary: 'Increment film views' })
  async incrementView(@Param('id') id: string) {
    return this.filmService.incrementView(id);
  }

  @Public()
  @Get(':id/recommendations')
  @ApiOperation({ summary: 'Get film recommendations' })
  async getRecommendations(@Param('id') id: string) {
    return this.filmService.getRecommendations(id);
  }

  @Delete(':id')
  @PermissionMeta({ name: 'Xóa phim', module: 'Quản lý phim', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Delete film' })
  async remove(@Param('id') id: string) {
    return this.filmService.delete(id);
  }

  @Put(':id')
  @PermissionMeta({ name: 'Cập nhật phim', module: 'Quản lý phim', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Update film' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.filmService.update(id, data);
  }
}

@ApiTags('types')
@Controller('types')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @Public()
  @Get()
  @PermissionMeta({ name: 'Xem danh sách thể loại', module: 'Quản lý thể loại', systemModule: 'BUSINESS' })
  async findAll() {
    return this.typeService.findAll(true);
  }

  @Public()
  @Get('hot')
  @PermissionMeta({ name: 'Xem thể loại hot', module: 'Quản lý thể loại', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get hot genres' })
  async getHotGenres() {
    return this.typeService.getHotGenres();
  }

  @Post()
  @PermissionMeta({ name: 'Tạo thể loại mới', module: 'Quản lý thể loại', systemModule: 'BUSINESS' })
  async create(@Body() data: any) {
    return this.typeService.create(data);
  }

  @Put(':id')
  @PermissionMeta({ name: 'Cập nhật thể loại', module: 'Quản lý thể loại', systemModule: 'BUSINESS' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.typeService.update(id, data);
  }

  @Delete(':id')
  @PermissionMeta({ name: 'Xóa thể loại', module: 'Quản lý thể loại', systemModule: 'BUSINESS' })
  async remove(@Param('id') id: string) {
    return this.typeService.remove(id);
  }
}

@ApiTags('actors')
@Controller('actors')
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  @Public()
  @Get()
  @PermissionMeta({ name: 'Xem danh sách diễn viên', module: 'Quản lý diễn viên', systemModule: 'BUSINESS' })
  async findAll() {
    return this.actorService.findAll();
  }

  @Public()
  @Get(':id')
  @PermissionMeta({ name: 'Xem chi tiết diễn viên', module: 'Quản lý diễn viên', systemModule: 'BUSINESS' })
  async findOne(@Param('id') id: string) {
    return this.actorService.findOne(id);
  }

  @Post('sync')
  @PermissionMeta({ name: 'Đồng bộ diễn viên', module: 'Quản lý diễn viên', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Manual sync actors with TMDB' })
  async syncAll() {
    // Run the cron job logic manually
    this.actorService.handleCron();
    return { message: 'Sync process started in background' };
  }

  @Post()
  @PermissionMeta({ name: 'Tạo diễn viên mới', module: 'Quản lý diễn viên', systemModule: 'BUSINESS' })
  async create(@Body() data: any) {
    return this.actorService.create(data);
  }

  @Put(':id')
  @PermissionMeta({ name: 'Cập nhật diễn viên', module: 'Quản lý diễn viên', systemModule: 'BUSINESS' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.actorService.update(id, data);
  }

  @Delete(':id')
  @PermissionMeta({ name: 'Xóa diễn viên', module: 'Quản lý diễn viên', systemModule: 'BUSINESS' })
  async remove(@Param('id') id: string) {
    return this.actorService.remove(id);
  }
}
