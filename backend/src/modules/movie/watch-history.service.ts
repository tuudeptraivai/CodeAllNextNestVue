import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WatchHistory } from './schemas/watch-history.schema';

@Injectable()
export class WatchHistoryService {
  constructor(
    @InjectModel(WatchHistory.name) private watchHistoryModel: Model<WatchHistory>,
  ) {}

  async updateProgress(
    userId: string,
    filmId: string,
    episodeSlug: string,
    serverName: string,
    duration: number,
    totalDuration: number,
  ) {
    return this.watchHistoryModel.findOneAndUpdate(
      { userId, filmId, episodeSlug },
      {
        $set: {
          serverName,
          duration,
          totalDuration,
          lastWatched: new Date(),
        },
      },
      { upsert: true, new: true },
    ).exec();
  }

  async getProgress(userId: string, filmId: string, episodeSlug: string) {
    return this.watchHistoryModel.findOne({ userId, filmId, episodeSlug }).exec();
  }

  async getFilmHistory(userId: string, filmId: string) {
    return this.watchHistoryModel.find({ userId, filmId }).sort({ lastWatched: -1 }).exec();
  }

  async getRecentHistory(userId: string, limit: number = 20) {
    return this.watchHistoryModel.find({ userId })
      .populate('filmId')
      .sort({ lastWatched: -1 })
      .limit(limit)
      .exec();
  }
}
