import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Rating, RatingSchema } from './schemas/rating.schema';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';
import { WatchHistory, WatchHistorySchema } from './schemas/watch-history.schema';
import { FilmReport, FilmReportSchema } from './schemas/film-report.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Film, FilmSchema } from '../movie/schemas/film.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Rating.name, schema: RatingSchema },
      { name: Playlist.name, schema: PlaylistSchema },
      { name: WatchHistory.name, schema: WatchHistorySchema },
      { name: FilmReport.name, schema: FilmReportSchema },
      { name: User.name, schema: UserSchema },
      { name: Film.name, schema: FilmSchema },
    ]),
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
