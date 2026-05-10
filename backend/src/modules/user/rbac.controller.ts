import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

import { PermissionMeta } from './decorators/permission.decorator';

@ApiTags('rbac')
@Controller('rbac')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Only logged in users (Admin usually)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // Permissions
  @Post('permissions')
  @PermissionMeta({ name: 'Tạo quyền hạn mới', module: 'Quản lý quyền API', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Create a new permission' })
  async createPermission(@Body() data: any) {
    return this.rbacService.createPermission(data);
  }

  @Get('permissions')
  @PermissionMeta({ name: 'Xem danh sách quyền hạn', module: 'Quản lý quyền API', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Get all permissions' })
  async findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Get('permissions/:id')
  @PermissionMeta({ name: 'Xem chi tiết quyền hạn', module: 'Quản lý quyền API', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Get permission by ID' })
  async findPermissionById(@Param('id') id: string) {
    return this.rbacService.findPermissionById(id);
  }

  @Put('permissions/:id')
  @PermissionMeta({ name: 'Cập nhật quyền hạn', module: 'Quản lý quyền API', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Update permission' })
  async updatePermission(@Param('id') id: string, @Body() data: any) {
    return this.rbacService.updatePermission(id, data);
  }

  @Delete('permissions/:id')
  @PermissionMeta({ name: 'Xóa quyền hạn', module: 'Quản lý quyền API', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Delete permission' })
  async deletePermission(@Param('id') id: string) {
    return this.rbacService.deletePermission(id);
  }

  // Roles
  @Post('roles')
  @PermissionMeta({ name: 'Tạo vai trò mới', module: 'Quản lý vai trò', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Create a new role' })
  async createRole(@Body() data: any, @Req() req: any) {
    const user = req.user;
    return this.rbacService.createRole(data, user);
  }

  @Get('roles')
  @PermissionMeta({ name: 'Xem danh sách vai trò', module: 'Quản lý vai trò', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Get all roles' })
  async findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  @PermissionMeta({ name: 'Xem chi tiết vai trò', module: 'Quản lý vai trò', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Get role by ID' })
  async findRoleById(@Param('id') id: string) {
    return this.rbacService.findRoleById(id);
  }

  @Put('roles/:id')
  @PermissionMeta({ name: 'Cập nhật vai trò', module: 'Quản lý vai trò', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Update role' })
  async updateRole(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const user = req.user;
    return this.rbacService.updateRole(id, data, user);
  }

  @Delete('roles/:id')
  @PermissionMeta({ name: 'Xóa vai trò', module: 'Quản lý vai trò', systemModule: 'SYSTEM_MANAGEMENT' })
  @ApiOperation({ summary: 'Delete role' })
  async deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }
}
