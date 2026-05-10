import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { FilmModule } from '../movie/film.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlerLog, CrawlerLogSchema } from './schemas/crawler-log.schema';

@Module({
  imports: [
    FilmModule,
    MongooseModule.forFeature([{ name: CrawlerLog.name, schema: CrawlerLogSchema }]),
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class CrawlerModule {}
