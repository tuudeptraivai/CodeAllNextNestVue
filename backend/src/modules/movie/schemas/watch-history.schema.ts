import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'watch_histories' })
export class WatchHistory extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Film', required: true })
  filmId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  episodeSlug: string;

  @Prop()
  serverName: string;

  @Prop({ default: 0 })
  duration: number; // Current seconds

  @Prop({ default: 0 })
  totalDuration: number; // Total seconds

  @Prop({ default: Date.now })
  lastWatched: Date;
}

export const WatchHistorySchema = SchemaFactory.createForClass(WatchHistory);

// Index for fast lookup
WatchHistorySchema.index({ userId: 1, filmId: 1, episodeSlug: 1 }, { unique: true });
