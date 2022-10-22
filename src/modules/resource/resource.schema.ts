import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { IsBoolean, IsDefined, IsString } from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Service } from '../service/service.schema';

export type ResourceDocument = Resource & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Resource {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  uuid: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
  service: Service;

  @IsString()
  @IsDefined()
  @Prop({ type: String, required: true })
  name: string;

  @IsString()
  @Prop({ type: String })
  description?: string;

  @IsBoolean()
  @Prop({ type: Boolean })
  is_active: boolean;

  created_at: Date;

  updated_at: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
