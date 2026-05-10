import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CrawlerLog extends Document {
  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ required: true })
  status: 'running' | 'success' | 'failed';

  @Prop({ default: 0 })
  moviesSynced: number;

  @Prop()
  error: string;

  @Prop()
  pagesCrawled: number;
}

export const CrawlerLogSchema = SchemaFactory.createForClass(CrawlerLog);
