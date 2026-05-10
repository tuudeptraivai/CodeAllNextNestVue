import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'films' })
export class Film extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  thumb_url: string;

  @Prop()
  poster_url: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: true })
  isPublic: boolean;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Type' }])
  types: MongooseSchema.Types.ObjectId[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Actor' }])
  actors: MongooseSchema.Types.ObjectId[];

  @Prop([String])
  galleries: string[];

  @Prop({ enum: ['ongoing', 'completed', 'trailer'], default: 'completed' })
  status: string;

  @Prop()
  releaseYear: number;

  // Crawler compatibility & Other fields
  @Prop({ unique: true })
  slug: string;

  @Prop()
  origin_name: string;

  @Prop()
  trailer_url: string;

  @Prop()
  time: string;

  @Prop()
  episode_current: string;

  @Prop()
  episode_total: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop()
  quality: string;

  @Prop()
  lang: string;

  @Prop([{ type: Object }])
  category: any[];

  @Prop([{ type: Object }])
  country: any[];

  @Prop([{ type: Object }])
  episodes: any[];
}

export const FilmSchema = SchemaFactory.createForClass(Film);

// Add text index for search
FilmSchema.index({ title: 'text', origin_name: 'text', description: 'text' });
