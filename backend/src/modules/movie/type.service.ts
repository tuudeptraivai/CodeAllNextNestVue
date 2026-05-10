import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Type } from './schemas/type.schema';

@Injectable()
export class TypeService {
  constructor(
    @InjectModel(Type.name) private typeModel: Model<Type>,
  ) {}

  async findAll(onlyPublic: boolean = false) {
    const filter = onlyPublic ? { isPublic: true } : {};
    return this.typeModel.find(filter).exec();
  }

  async findOne(id: string) {
    const type = await this.typeModel.findById(id).exec();
    if (!type) throw new NotFoundException('Type not found');
    return type;
  }

  async create(data: any) {
    const newType = new this.typeModel(data);
    return newType.save();
  }

  async update(id: string, data: any) {
    return this.typeModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.typeModel.findByIdAndDelete(id).exec();
  }

  async upsert(data: any) {
    const { slug, ...updateData } = data;
    return this.typeModel.findOneAndUpdate({ slug }, { $set: updateData }, { upsert: true, new: true }).exec();
  }

  async getHotGenres() {
    // Basic logic: genres that have films, sorted by name for now, but could be views in the future
    return this.typeModel.find({ isPublic: true }).limit(10).exec();
  }
}
