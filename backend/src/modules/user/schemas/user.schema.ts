import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop({ enum: ['male', 'female', 'other'] })
  gender: string;

  @Prop()
  avatar: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Film' }])
  favoriteFilms: MongooseSchema.Types.ObjectId[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Actor' }])
  favoriteActors: MongooseSchema.Types.ObjectId[];

  @Prop([{
    name: { type: String },
    films: [{ type: MongooseSchema.Types.ObjectId, ref: 'Film' }]
  }])
  collections: { name: string, films: MongooseSchema.Types.ObjectId[] }[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
  role: MongooseSchema.Types.ObjectId;

  @Prop([{
    film: { type: MongooseSchema.Types.ObjectId, ref: 'Film' },
    filmTitle: { type: String },
    thumbnail: { type: String },
    episodeSlug: { type: String },
    episodeName: { type: String },
    currentTime: { type: Number },
    duration: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  }])
  watchHistory: { 
    film: MongooseSchema.Types.ObjectId, 
    filmTitle: string,
    thumbnail: string,
    episodeSlug: string, 
    episodeName: string,
    currentTime: number, 
    duration: number,
    updatedAt: Date 
  }[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ enum: ['free', 'premium', 'promax'], default: 'free' })
  membership: string;

  @Prop()
  membershipExpiresAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
