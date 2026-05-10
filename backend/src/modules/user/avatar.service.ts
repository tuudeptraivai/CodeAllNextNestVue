import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TypeAvatar } from './schemas/type-avatar.schema';
import { ImgAvatar } from './schemas/img-avatar.schema';

@Injectable()
export class AvatarService {
  constructor(
    @InjectModel(TypeAvatar.name) private typeAvatarModel: Model<TypeAvatar>,
    @InjectModel(ImgAvatar.name) private imgAvatarModel: Model<ImgAvatar>,
  ) {}

  async findAllTypes() {
    return this.typeAvatarModel.find().exec();
  }

  async findAvatarsByType(typeAvatarId: string) {
    return this.imgAvatarModel.find({ typeAvatarId }).exec();
  }

  async createType(data: any) {
    return new this.typeAvatarModel(data).save();
  }

  async createAvatar(data: any) {
    return new this.imgAvatarModel(data).save();
  }
}
