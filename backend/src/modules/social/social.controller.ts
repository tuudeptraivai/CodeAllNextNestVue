import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, Put, Query } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PermissionMeta } from '../user/decorators/permission.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('social')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // Comments
  @Public()
  @Get('comments/:filmId')
  @PermissionMeta({ name: 'Xem bình luận của phim', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get comments by film' })
  async getComments(@Param('filmId') filmId: string) {
    return this.socialService.getCommentsByMovie(filmId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('comments')
  @PermissionMeta({ name: 'Đăng bình luận', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Create a comment' })
  async createComment(@Request() req, @Body() createCommentDto: CreateCommentDto) {
    return this.socialService.createComment(
      req.user.userId, 
      createCommentDto.filmId, 
      createCommentDto.content, 
      createCommentDto.parentCommentId
    );
  }


  @Public()
  @Get('comments/top')
  @PermissionMeta({ name: 'Xem bình luận hàng đầu', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get top comments across all films' })
  async getTopComments(@Query('limit') limit: number = 10) {
    return this.socialService.getTopComments(limit);
  }

  @Public()
  @Get('comments/hot')
  @PermissionMeta({ name: 'Xem bình luận nổi bật', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get hot comments across all films' })
  async getHotComments(@Query('limit') limit: number = 10) {
    return this.socialService.getHotComments(limit);
  }

  @Post('comments/:commentId/vote')
  @PermissionMeta({ name: 'Bình chọn bình luận', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Vote on a comment' })
  async voteComment(@Param('commentId') commentId: string, @Query('type') type: 'up' | 'down') {
    return this.socialService.voteComment(commentId, type);
  }

  // Ratings
  @Public()
  @Get('ratings/:filmId')
  @PermissionMeta({ name: 'Xem đánh giá phim', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get average rating of a film' })
  async getAverageRating(@Param('filmId') filmId: string) {
    const avg = await this.socialService.getAverageRating(filmId);
    return { average: avg };
  }

  @Public()
  @Get('ratings/top')
  @PermissionMeta({ name: 'Xem đánh giá hàng đầu', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get top ratings/reviews across all films' })
  async getTopRatings(@Query('limit') limit: number = 10) {
    return this.socialService.getTopRatings(limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('ratings')
  @PermissionMeta({ name: 'Đánh giá phim', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Create or update a rating' })
  async createRating(@Request() req, @Body() createRatingDto: CreateRatingDto) {
    return this.socialService.createRating(
      req.user.userId, 
      createRatingDto.filmId, 
      createRatingDto.score, 
      createRatingDto.content
    );
  }

  @Post('ratings/:ratingId/vote')
  @PermissionMeta({ name: 'Bình chọn đánh giá', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Vote on a rating' })
  async voteRating(@Param('ratingId') ratingId: string, @Query('type') type: 'up' | 'down') {
    return this.socialService.voteRating(ratingId, type);
  }

  // Playlists
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('playlists')
  @PermissionMeta({ name: 'Tạo playlist', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Create a playlist' })
  async createPlaylist(@Request() req, @Body() body: { name: string, description?: string, isPublic?: boolean }) {
    return this.socialService.createPlaylist(req.user.userId, body.name, body.description, body.isPublic);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('playlists')
  @PermissionMeta({ name: 'Xem danh sách playlist', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get user playlists' })
  async getPlaylists(@Request() req) {
    return this.socialService.getPlaylistsByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('playlists/:playlistId/films/:filmId')
  @PermissionMeta({ name: 'Thêm phim vào playlist', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Add film to playlist' })
  async addFilmToPlaylist(@Param('playlistId') playlistId: string, @Param('filmId') filmId: string) {
    return this.socialService.addFilmToPlaylist(playlistId, filmId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('playlists/:playlistId/films/:filmId')
  @PermissionMeta({ name: 'Xóa phim khỏi playlist', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Remove film from playlist' })
  async removeFilmFromPlaylist(@Param('playlistId') playlistId: string, @Param('filmId') filmId: string) {
    return this.socialService.removeFilmFromPlaylist(playlistId, filmId);
  }

  // Reports
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('reports')
  @PermissionMeta({ name: 'Báo cáo lỗi phim', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Report a film issue' })
  async createReport(@Request() req, @Body() body: { filmId: string, issueType: string, description?: string }) {
    return this.socialService.createReport(req.user.userId, body.filmId, body.issueType, body.description);
  }

  // Like System
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('like/:filmId')
  @PermissionMeta({ name: 'Thích phim', module: 'Mạng xã hội', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Toggle like a film' })
  async toggleLike(@Request() req, @Param('filmId') filmId: string) {
    return this.socialService.toggleLike(req.user.userId, filmId);
  }
}
