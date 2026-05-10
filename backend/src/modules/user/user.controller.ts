import { Controller, Get, Post, Param, UseGuards, Request, Body, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { AvatarService } from './avatar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionMeta } from './decorators/permission.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @PermissionMeta({ name: 'Xem hồ sơ cá nhân', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req) {
    return this.userService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  @PermissionMeta({ name: 'Xem danh sách người dùng', module: 'Người dùng', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Get all users (Admin)' })
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @PermissionMeta({ name: 'Cập nhật hồ sơ cá nhân', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req, @Body() data: any) {
    return this.userService.updateProfile(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('avatar')
  @PermissionMeta({ name: 'Cập nhật ảnh đại diện', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Update user avatar' })
  async updateAvatar(@Request() req, @Body('avatar') avatar: string) {
    return this.userService.updateAvatar(req.user.userId, avatar);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  @PermissionMeta({ name: 'Đổi mật khẩu', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@Request() req, @Body() data: any) {
    return this.userService.changePassword(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bookmarks/film/:filmId')
  @PermissionMeta({ name: 'Bookmark phim', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Toggle film bookmark' })
  async toggleFilmBookmark(@Request() req, @Param('filmId') filmId: string) {
    return this.userService.toggleFilmBookmark(req.user.userId, filmId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bookmarks/actor/:actorId')
  @PermissionMeta({ name: 'Bookmark diễn viên', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Toggle actor bookmark' })
  async toggleActorBookmark(@Request() req, @Param('actorId') actorId: string) {
    return this.userService.toggleActorBookmark(req.user.userId, actorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookmarks')
  @PermissionMeta({ name: 'Xem danh sách bookmark', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get all user bookmarks' })
  async getBookmarks(@Request() req) {
    return this.userService.getBookmarks(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('collections')
  @PermissionMeta({ name: 'Tạo bộ sưu tập phim', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Create a new movie collection' })
  async createCollection(@Request() req, @Body('name') name: string) {
    return this.userService.createCollection(req.user.userId, name);
  }

  @UseGuards(JwtAuthGuard)
  @Post('collections/add-film')
  @PermissionMeta({ name: 'Thêm phim vào bộ sưu tập', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Add film to multiple collections' })
  async addFilmToCollections(
    @Request() req, 
    @Body('filmId') filmId: string, 
    @Body('collectionNames') collectionNames: string[]
  ) {
    return this.userService.addFilmToCollections(req.user.userId, filmId, collectionNames);
  }

  @UseGuards(JwtAuthGuard)
  @Post('collections/remove-film')
  @PermissionMeta({ name: 'Xóa phim khỏi bộ sưu tập', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Remove film from a collection' })
  async removeFilmFromCollection(
    @Request() req, 
    @Body('filmId') filmId: string, 
    @Body('collectionName') collectionName: string
  ) {
    return this.userService.removeFilmFromCollection(req.user.userId, filmId, collectionName);
  }

  @UseGuards(JwtAuthGuard)
  @Post('watch-history')
  @PermissionMeta({ name: 'Cập nhật lịch sử xem', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Update watch history progress' })
  async updateWatchHistory(@Request() req, @Body() data: any) {
    return this.userService.updateWatchHistory(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('watch-history')
  @PermissionMeta({ name: 'Xem lịch sử xem', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Get watch history' })
  async getWatchHistory(@Request() req) {
    return this.userService.getWatchHistory(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('watch-history/:filmId')
  @PermissionMeta({ name: 'Xóa lịch sử xem', module: 'Người dùng', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Remove film from watch history' })
  async removeWatchHistory(@Request() req, @Param('filmId') filmId: string) {
    return this.userService.removeWatchHistory(req.user.userId, filmId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/role')
  @PermissionMeta({ name: 'Gán vai trò cho người dùng', module: 'Người dùng', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Assign role to user' })
  async assignRole(@Param('id') id: string, @Body('roleId') roleId: string) {
    return this.userService.assignRole(id, roleId);
  }
}

@ApiTags('avatars')
@Controller('avatars')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Public()
  @Get('types')
  @PermissionMeta({ name: 'Xem danh sách loại avatar', module: 'Quản lý Avatar', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Get all avatar types' })
  async findAllTypes() {
    return this.avatarService.findAllTypes();
  }

  @Public()
  @Get('type/:typeId')
  @PermissionMeta({ name: 'Xem danh sách avatar theo loại', module: 'Quản lý Avatar', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Get avatars by type' })
  async findByType(@Param('typeId') typeId: string) {
    return this.avatarService.findAvatarsByType(typeId);
  }

  @Post('types')
  @PermissionMeta({ name: 'Tạo loại avatar mới', module: 'Quản lý Avatar', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Create avatar type (Admin)' })
  async createType(@Body() data: any) {
    return this.avatarService.createType(data);
  }

  @Post()
  @PermissionMeta({ name: 'Tạo ảnh avatar mới', module: 'Quản lý Avatar', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Create avatar image (Admin)' })
  async createAvatar(@Body() data: any) {
    return this.avatarService.createAvatar(data);
  }
}
