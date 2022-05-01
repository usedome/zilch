import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsDefined, IsString } from 'class-validator';
import { Schema as MongooseSchema, Document } from 'mongoose';
import { Resource } from '../resource/resource.schema';
import { User } from '../user/user.schema';

export type ServiceDocument = Service & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
})
export class Service {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  uuid: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @IsDefined()
  @IsString()
  @Prop({ type: String, required: true })
  name: string;

  @IsString()
  @Prop({ type: String })
  description?: string;

  resources: Resource[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
