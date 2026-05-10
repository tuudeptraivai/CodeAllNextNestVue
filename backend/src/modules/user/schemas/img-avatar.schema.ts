import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class ImgAvatar extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TypeAvatar', required: true })
  typeAvatarId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  url: string;
}

export const ImgAvatarSchema = SchemaFactory.createForClass(ImgAvatar);
