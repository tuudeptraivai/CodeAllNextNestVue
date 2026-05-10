import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Film, FilmSchema } from '../movie/schemas/film.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Type, TypeSchema } from '../movie/schemas/type.schema';
import { CrawlerLog, CrawlerLogSchema } from '../crawler/schemas/crawler-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Film.name, schema: FilmSchema },
      { name: User.name, schema: UserSchema },
      { name: Type.name, schema: TypeSchema },
      { name: CrawlerLog.name, schema: CrawlerLogSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
