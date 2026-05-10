import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from './schemas/film.schema';

@Injectable()
export class FilmService {
  constructor(
    @InjectModel(Film.name) private filmModel: Model<Film>,
  ) {}

  async findAll(page: number = 1, limit: number = 20, filter: any = {}, sort: string = 'newest') {
    const skip = (page - 1) * limit;
    
    const sortType = String(sort || 'newest').trim().toLowerCase();
    const sortDirection = sortType === 'oldest' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.filmModel.find(filter)
        .populate('types')
        .populate('actors')
        .sort({ createdAt: sortDirection as any })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.filmModel.countDocuments(filter),
    ]);


    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }



  async findOneBySlug(slug: string) {
    const film = await this.filmModel.findOne({ slug })
      .populate('types')
      .populate('actors')
      .exec();
    if (!film) {
      throw new NotFoundException(`Film with slug ${slug} not found`);
    }
    return film;
  }

  async search(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const filter = {
      $text: { $search: query },
    };

    const [data, total] = await Promise.all([
      this.filmModel.find(filter)
        .populate('types')
        .populate('actors')
        .skip(skip).limit(limit).exec(),
      this.filmModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createOrUpdate(filmData: any) {
    // Map crawler fields to new schema if necessary
    const mappedData = {
      ...filmData,
      title: filmData.name || filmData.title,
      description: filmData.content || filmData.description,
      views: filmData.view || filmData.views || 0,
      releaseYear: filmData.year || filmData.releaseYear,
    };

    const { slug, _id, ...updateData } = mappedData;
    return this.filmModel.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { upsert: true, new: true },
    ).exec();
  }

  async update(id: string, data: any) {
    return this.filmModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return this.filmModel.findByIdAndDelete(id).exec();
  }

  async incrementView(id: string) {
    return this.filmModel.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).exec();
  }

  async findTopLiked(limit: number = 10) {
    return this.filmModel.find({ isPublic: true })
      .sort({ likes: -1, views: -1 })
      .limit(limit)
      .exec();
  }

  async findTopViews(limit: number = 10) {
    return this.filmModel.find({ isPublic: true })
      .sort({ views: -1 })
      .limit(limit)
      .exec();
  }

  async findTopSeries(limit: number = 10) {
    // Filter films that have more than 1 episode or are marked as series
    return this.filmModel.find({ 
      isPublic: true,
      $or: [
        { episode_total: { $ne: '1' } },
        { status: 'ongoing' }
      ]
    })
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .exec();
  }

  async getRecommendations(id: string) {
    const film = await this.filmModel.findById(id).exec();
    if (!film) throw new NotFoundException('Film not found');

    // Recommend films with same types
    return this.filmModel.find({
      _id: { $ne: id },
      types: { $in: film.types },
      isPublic: true,
    })
    .limit(10)
    .exec();
  }
}
