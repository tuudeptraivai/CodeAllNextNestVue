import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmController, TypeController, ActorController } from './film.controller';
import { WatchHistoryController } from './watch-history.controller';
import { FilmService } from './film.service';
import { TypeService } from './type.service';
import { ActorService } from './actor.service';
import { WatchHistoryService } from './watch-history.service';
import { Film, FilmSchema } from './schemas/film.schema';
import { Type, TypeSchema } from './schemas/type.schema';
import { Actor, ActorSchema } from './schemas/actor.schema';
import { WatchHistory, WatchHistorySchema } from './schemas/watch-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Film.name, schema: FilmSchema },
      { name: Type.name, schema: TypeSchema },
      { name: Actor.name, schema: ActorSchema },
      { name: WatchHistory.name, schema: WatchHistorySchema },
    ]),
  ],
  controllers: [FilmController, TypeController, ActorController, WatchHistoryController],
  providers: [FilmService, TypeService, ActorService, WatchHistoryService],
  exports: [FilmService, TypeService, ActorService, WatchHistoryService],
})
export class FilmModule {}
