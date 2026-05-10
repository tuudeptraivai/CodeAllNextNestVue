import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Type extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ unique: true })
  slug: string;

  @Prop({ default: true })
  isPublic: boolean;
}

export const TypeSchema = SchemaFactory.createForClass(Type);
