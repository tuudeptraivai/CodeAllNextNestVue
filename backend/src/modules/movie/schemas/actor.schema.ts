import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Actor extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  avatar: string;

  @Prop()
  bio: string;

  @Prop()
  birthDate: Date;

  @Prop()
  nationality: string;
}

export const ActorSchema = SchemaFactory.createForClass(Actor);
