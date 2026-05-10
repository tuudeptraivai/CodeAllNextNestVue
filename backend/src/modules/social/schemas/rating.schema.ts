import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Rating extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Film', required: true })
  filmId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 1, max: 10 })
  score: number;

  @Prop()
  content: string;

  @Prop({ default: 0 })
  upVotes: number;

  @Prop({ default: 0 })
  downVotes: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
