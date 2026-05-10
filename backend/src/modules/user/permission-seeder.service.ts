import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ModulesContainer, MetadataScanner, Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from './schemas/permission.schema';
import { Role } from './schemas/role.schema';
import { PERMISSION_META_KEY, PermissionMetadata } from './decorators/permission.decorator';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';

@Injectable()
export class PermissionSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionSeederService.name);

  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Scanning controllers for permissions...');
    await this.seedPermissions();
    await this.syncAdminPermissions();
    await this.syncUserPermissions();
    this.logger.log('Permission seeding complete.');
  }

  async syncUserPermissions() {
    this.logger.log('Syncing default permissions for user role...');
    const userRole = await this.roleModel.findOne({ name: 'user' });
    if (!userRole) return;
    // Sync default permissions for user role
    const defaultUserPermissions = [
      'Xem hồ sơ cá nhân',
      'Cập nhật hồ sơ cá nhân',
      'Cập nhật ảnh đại diện',
      'Đổi mật khẩu',
      'Bookmark phim',
      'Bookmark diễn viên',
      'Xem danh sách bookmark',
      'Đăng bình luận',
      'Bình chọn bình luận',
      'Đánh giá phim',
      'Bình chọn đánh giá',
      'Tạo bộ sưu tập phim',
      'Xem danh sách bộ sưu tập',
      'Thêm phim vào bộ sưu tập',
      'Xóa phim khỏi bộ sưu tập',
      'Báo cáo lỗi phim',
      'Cập nhật lịch sử xem',
      'Xem lịch sử xem',
      'Xóa lịch sử xem'
    ];

    const permissions = await this.permissionModel.find({
      name: { $in: defaultUserPermissions }
    }, { _id: 1 }).exec();

    if (permissions.length > 0) {
      await this.roleModel.findByIdAndUpdate(userRole._id, {
        $addToSet: { permissions: { $each: permissions.map(p => p._id) } }
      });
      this.logger.log(`User role synced with ${permissions.length} default permissions.`);
    }
  }

  async syncAdminPermissions() {
    this.logger.log('Syncing full permissions for admin role...');
    const allPermissions = await this.permissionModel.find({}, { _id: 1 }).exec();
    const permissionIds = allPermissions.map(p => p._id);

    const adminRole = await this.roleModel.findOneAndUpdate(
      { name: 'admin' },
      { 
        $set: { permissions: permissionIds },
        $setOnInsert: { description: 'Super administrator with full access' }
      },
      { upsert: true, new: true }
    );

    this.logger.log(`Admin role synced with ${permissionIds.length} permissions.`);
  }

  async seedPermissions() {
    const modules = [...this.modulesContainer.values()];
    
    for (const module of modules) {
      const controllers = [...module.controllers.values()];
      
      for (const controller of controllers) {
        const controllerInstance = controller.instance;
        if (!controllerInstance) continue;

        const controllerPrototype = Object.getPrototypeOf(controllerInstance);
        const controllerPath = this.reflector.get<string>(PATH_METADATA, controller.metatype);
        
        const methodNames = this.metadataScanner.getAllMethodNames(controllerPrototype);

        for (const methodName of methodNames) {
          const method = controllerInstance[methodName];
          const permissionMeta = this.reflector.get<PermissionMetadata>(PERMISSION_META_KEY, method);
          
          if (permissionMeta) {
            const httpMethodCode = this.reflector.get<number>(METHOD_METADATA, method);
            const methodPath = this.reflector.get<string>(PATH_METADATA, method);
            
            const httpMethod = this.getHttpMethodName(httpMethodCode);
            const fullPath = this.combinePaths(controllerPath, methodPath);

            await this.upsertPermission({
              name: permissionMeta.name,
              apiPath: fullPath,
              method: httpMethod,
              module: permissionMeta.module,
              systemModule: permissionMeta.systemModule || 'BUSINESS',
              description: permissionMeta.name,
            });
          }
        }
      }
    }
  }

  private getHttpMethodName(code: number): string {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
    return methods[code] || 'GET';
  }

  private combinePaths(controllerPath: string, methodPath: string): string {
    const cleanControllerPath = controllerPath.startsWith('/') ? controllerPath : `/${controllerPath}`;
    const cleanMethodPath = methodPath === '/' ? '' : (methodPath.startsWith('/') ? methodPath : `/${methodPath}`);
    return `${cleanControllerPath}${cleanMethodPath}`.replace(/\/+$/, '') || '/';
  }

  private async upsertPermission(data: any) {
    const uniqueName = `${data.method}:${data.apiPath}`;
    // We can use name or a combination for uniqueness.
    // Based on the previous task, 'name' was unique. Let's stick to that or use a better unique constraint if needed.
    // To avoid duplicates if name changes, maybe use method + path as unique key in logic.
    
    const existing = await this.permissionModel.findOne({ 
      $or: [
        { name: data.name },
        { apiPath: data.apiPath, method: data.method }
      ]
    });

    if (existing) {
      await this.permissionModel.findByIdAndUpdate(existing._id, data);
      this.logger.debug(`Updated permission: ${data.name} [${data.method} ${data.apiPath}]`);
    } else {
      await new this.permissionModel(data).save();
      this.logger.debug(`Created permission: ${data.name} [${data.method} ${data.apiPath}]`);
    }
  }
}
