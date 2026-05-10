import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from '../movie/schemas/film.schema';
import { User } from '../user/schemas/user.schema';
import { Type } from '../movie/schemas/type.schema';
import { CrawlerLog } from '../crawler/schemas/crawler-log.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Film.name) private filmModel: Model<Film>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Type.name) private typeModel: Model<Type>,
    @InjectModel(CrawlerLog.name) private crawlerLogModel: Model<CrawlerLog>,
  ) {}

  async getStats() {
    const [totalFilms, totalUsers, totalGenres, recentLogs] = await Promise.all([
      this.filmModel.countDocuments(),
      this.userModel.countDocuments(),
      this.typeModel.countDocuments(),
      this.crawlerLogModel.find().sort({ startTime: -1 }).limit(5).exec(),
    ]);

    // Simple chart data: Films by status
    const filmsByStatus = await this.filmModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return {
      totalFilms,
      totalUsers,
      totalGenres,
      recentLogs,
      filmsByStatus: filmsByStatus.map(item => ({
        status: item._id || 'unknown',
        count: item.count
      }))
    };
  }
}
