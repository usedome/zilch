import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class User {
  _id: MongooseSchema.Types.ObjectId;

  uuid: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop({ type: String, required: true })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
