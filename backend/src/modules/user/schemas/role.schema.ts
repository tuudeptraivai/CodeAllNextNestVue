import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  name: string; // e.g., "admin", "user"

  @Prop()
  description: string;

  @Prop([String])
  systemModules: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Permission' }])
  permissions: MongooseSchema.Types.ObjectId[];

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
