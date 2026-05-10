import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class WatchHistory extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Film', required: true })
  filmId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  progress: number; // in seconds or %

  @Prop({ default: 1 })
  episode: number;

  @Prop({ default: Date.now })
  watchedAt: Date;
}

export const WatchHistorySchema = SchemaFactory.createForClass(WatchHistory);
