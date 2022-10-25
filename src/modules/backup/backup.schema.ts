import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Resource } from '../resource/resource.schema';

export type BackupDocument = Backup & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Backup {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  uuid: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Resource',
    required: true,
  })
  resource: Resource;

  @Prop({
    type: String,
    required: true,
  })
  url: string;

  created_at: Date;

  updated_at: Date;
}

export const BackupSchema = SchemaFactory.createForClass(Backup);
