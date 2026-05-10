import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';
import { Permission } from './schemas/permission.schema';

@Injectable()
export class RbacService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  // Permissions CRUD
  async createPermission(data: any) {
    return new this.permissionModel(data).save();
  }

  async findAllPermissions() {
    return this.permissionModel.find().exec();
  }

  async findPermissionById(id: string) {
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async updatePermission(id: string, data: any) {
    return this.permissionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deletePermission(id: string) {
    return this.permissionModel.findByIdAndDelete(id).exec();
  }

  // Roles CRUD
  async createRole(data: any, user?: any) {
    const roleData = {
      ...data,
      createdBy: user?.username || 'System',
      updatedBy: user?.username || 'System',
    };
    return new this.roleModel(roleData).save();
  }

  async findAllRoles() {
    return this.roleModel.find().populate('permissions').exec();
  }

  async findRoleById(id: string) {
    const role = await this.roleModel.findById(id).populate('permissions').exec();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async updateRole(id: string, data: any, user?: any) {
    if (data.name) {
      const existing = await this.roleModel.findOne({ 
        name: data.name.toLowerCase().trim(), 
        _id: { $ne: id } 
      });
      if (existing) {
        throw new Error(`Role name "${data.name}" already exists`);
      }
    }

    const updateData = {
      ...data,
      updatedBy: user?.username || 'System',
    };
    return this.roleModel.findByIdAndUpdate(id, updateData, { new: true }).populate('permissions').exec();
  }

  async deleteRole(id: string) {
    return this.roleModel.findByIdAndDelete(id).exec();
  }
}
