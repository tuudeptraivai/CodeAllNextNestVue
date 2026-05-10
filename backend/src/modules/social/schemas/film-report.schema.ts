import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class FilmReport extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Film', required: true })
  filmId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  issueType: string;

  @Prop()
  description: string;

  @Prop({ enum: ['pending', 'resolved', 'ignored'], default: 'pending' })
  status: string;
}

export const FilmReportSchema = SchemaFactory.createForClass(FilmReport);
