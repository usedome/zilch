import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { IsDefined, IsString, MinLength, IsEmail } from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Service } from '../service/service.schema';

export type UserDocument = User & Document;

class UserReset {
  token: string;
  expires_in: number;
}

class UserEmailReset extends UserReset {
  email?: string;
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    virtuals: true,
    transform: (_, user) => {
      delete user['password'];
      delete user['password_reset'];
      return user;
    },
  },
})
export class User {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  uuid: string;

  @Prop({ type: String, required: true })
  @IsString()
  @IsDefined()
  first_name: string;

  @Prop({ type: String, required: true })
  @IsString()
  @IsDefined()
  last_name: string;

  @Prop({
    type: String,
    unique: true,
    required: true,
    set: (email: string) => email.toLowerCase(),
  })
  @IsDefined()
  @IsEmail()
  email: string;

  @Prop({ type: String })
  email_verification_token?: String;

  @Prop({ type: MongooseSchema.Types.Mixed })
  email_reset?: UserEmailReset;

  @Prop({ type: String })
  @IsString()
  @IsDefined()
  @MinLength(8)
  password: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  password_reset?: UserReset;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: String })
  @IsString()
  default_service?: string;

  services: Service[];
}

export const UserSchema = SchemaFactory.createForClass(User);
