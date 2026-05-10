import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController, AvatarController } from './user.controller';
import { RbacController } from './rbac.controller';
import { UserService } from './user.service';
import { AvatarService } from './avatar.service';
import { RbacService } from './rbac.service';
import { User, UserSchema } from './schemas/user.schema';
import { TypeAvatar, TypeAvatarSchema } from './schemas/type-avatar.schema';
import { ImgAvatar, ImgAvatarSchema } from './schemas/img-avatar.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PermissionSchema } from './schemas/permission.schema';

import { MetadataScanner } from '@nestjs/core';
import { PermissionSeederService } from './permission-seeder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TypeAvatar.name, schema: TypeAvatarSchema },
      { name: ImgAvatar.name, schema: ImgAvatarSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [UserController, AvatarController, RbacController],
  providers: [UserService, AvatarService, RbacService, PermissionSeederService, MetadataScanner],
  exports: [UserService, AvatarService, RbacService],
})
export class UserModule {}
