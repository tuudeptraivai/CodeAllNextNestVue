import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { Rating } from './schemas/rating.schema';
import { Playlist } from './schemas/playlist.schema';
import { WatchHistory } from './schemas/watch-history.schema';
import { FilmReport } from './schemas/film-report.schema';
import { User } from '../user/schemas/user.schema';
import { Film } from '../movie/schemas/film.schema';

@Injectable()
export class SocialService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
    @InjectModel(WatchHistory.name) private watchHistoryModel: Model<WatchHistory>,
    @InjectModel(FilmReport.name) private filmReportModel: Model<FilmReport>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Film.name) private filmModel: Model<Film>,
  ) {}

  // Comments
  async createComment(userId: string, filmId: string, content: string, parentCommentId: string = null) {
    const newComment = new this.commentModel({
      userId,
      filmId,
      content,
      parentCommentId,
    });
    return newComment.save();
  }

  async getCommentsByMovie(filmId: string) {
    return this.commentModel.find({ filmId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async voteComment(commentId: string, type: 'up' | 'down') {
    const field = type === 'up' ? 'upVotes' : 'downVotes';
    return this.commentModel.findByIdAndUpdate(commentId, { $inc: { [field]: 1 } }, { new: true }).exec();
  }

  // Ratings
  async createRating(userId: string, filmId: string, score: number, content: string) {
    return this.ratingModel.findOneAndUpdate(
      { userId, filmId },
      { score, content },
      { upsert: true, new: true },
    ).exec();
  }

  async getAverageRating(filmId: string) {
    const ratings = await this.ratingModel.find({ filmId }).exec();
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr.score, 0);
    return sum / ratings.length;
  }

  async voteRating(ratingId: string, type: 'up' | 'down') {
    const field = type === 'up' ? 'upVotes' : 'downVotes';
    return this.ratingModel.findByIdAndUpdate(ratingId, { $inc: { [field]: 1 } }, { new: true }).exec();
  }

  // Playlists
  async createPlaylist(userId: string, name: string, description?: string, isPublic: boolean = false) {
    return new this.playlistModel({ userId, name, description, isPublic }).save();
  }

  async getPlaylistsByUser(userId: string) {
    return this.playlistModel.find({ userId }).populate('films').exec();
  }

  async addFilmToPlaylist(playlistId: string, filmId: string) {
    return this.playlistModel.findByIdAndUpdate(
      playlistId,
      { $addToSet: { films: filmId } },
      { new: true }
    ).exec();
  }

  async removeFilmFromPlaylist(playlistId: string, filmId: string) {
    return this.playlistModel.findByIdAndUpdate(
      playlistId,
      { $pull: { films: filmId } },
      { new: true }
    ).exec();
  }

  // Watch History
  async updateWatchHistory(userId: string, filmId: string, progress: number, episode: number) {
    return this.watchHistoryModel.findOneAndUpdate(
      { userId, filmId },
      { progress, episode, watchedAt: new Date() },
      { upsert: true, new: true }
    ).exec();
  }

  async getWatchHistory(userId: string) {
    return this.watchHistoryModel.find({ userId })
      .populate('filmId')
      .sort({ watchedAt: -1 })
      .exec();
  }

  // Reports
  async createReport(userId: string, filmId: string, issueType: string, description?: string) {
    return new this.filmReportModel({ userId, filmId, issueType, description }).save();
  }

  // Specialized Queries
  async getTopComments(limit: number = 10) {
    return this.commentModel.find({ parentCommentId: null })
      .populate('userId', 'username avatar')
      .populate('filmId', 'title slug')
      .sort({ upVotes: -1 })
      .limit(limit)
      .exec();
  }

  async getHotComments(limit: number = 10) {
    return this.commentModel.find({ parentCommentId: null })
      .populate('userId', 'username avatar')
      .populate('filmId', 'title slug')
      .sort({ createdAt: -1, upVotes: -1 })
      .limit(limit)
      .exec();
  }

  async getTopRatings(limit: number = 10) {
    return this.ratingModel.find()
      .populate('userId', 'username avatar')
      .populate('filmId', 'title slug')
      .sort({ upVotes: -1, score: -1 })
      .limit(limit)
      .exec();
  }

  // Like System
  async toggleLike(userId: string, filmId: string) {
    console.log(`[SocialService] toggleLike called: userId=${userId}, filmId=${filmId}`);
    
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const film = await this.filmModel.findById(filmId);
    if (!film) throw new NotFoundException(`Film with ID ${filmId} not found`);

    // Check if liked (comparing as strings)
    const isLiked = user.favoriteFilms.some(id => id.toString() === filmId);
    
    if (isLiked) {
      console.log(`[SocialService] Action: UNLIKE (pulling from list)`);
      await this.userModel.findByIdAndUpdate(userId, { 
        $pull: { favoriteFilms: filmId } 
      });
      await this.filmModel.findByIdAndUpdate(filmId, { $inc: { likes: -1 } });
    } else {
      console.log(`[SocialService] Action: LIKE (adding to list)`);
      await this.userModel.findByIdAndUpdate(userId, { 
        $addToSet: { favoriteFilms: filmId } 
      });
      await this.filmModel.findByIdAndUpdate(filmId, { $inc: { likes: 1 } });
    }
    
    // Return the updated user document
    return this.userModel.findById(userId).exec();
  }
}
