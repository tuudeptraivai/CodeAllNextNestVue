import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Film', required: true })
  filmId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comment', default: null })
  parentCommentId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  upVotes: number;

  @Prop({ default: 0 })
  downVotes: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
