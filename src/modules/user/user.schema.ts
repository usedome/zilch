import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { IsDefined, IsString, MinLength, IsEmail } from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Service } from '../service/service.schema';

export type UserDocument = User & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
})
export class User {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  uuid: string;

  @Prop({ type: String, required: true })
  @IsString()
  @IsDefined()
  name: string;

  @Prop({ type: String, unique: true, required: true })
  @IsEmail()
  email: string;

  @Prop({ type: String, required: true })
  @IsString()
  @IsDefined()
  @MinLength(8)
  password: string;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: Date })
  email_verified_at?: Date;

  @Prop({ type: String })
  @IsString()
  default_service?: string;

  services: Service[];
}

export const UserSchema = SchemaFactory.createForClass(User);
