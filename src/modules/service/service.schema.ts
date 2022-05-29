import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsDefined, IsString } from 'class-validator';
import { Schema as MongooseSchema, Document } from 'mongoose';
import { User } from '../user/user.schema';

export type ServiceDocument = Service & Document;

class ServiceApiKey {
  name: string;
  uuid: string;
  key: string;
  last_used: Date | null;
}

class ServiceIpAddress {
  uuid: string;
  value: string;
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { getters: true },
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

  @IsDefined()
  @IsString()
  @Prop({ type: String })
  backup_duration: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    get: (api_keys) => {
      if (!api_keys) return [];
      api_keys.reverse();
      return api_keys;
    },
  })
  api_keys: ServiceApiKey[];

  @Prop({
    type: MongooseSchema.Types.Mixed,
    get: (ips) => {
      if (!ips) return [];
      ips.reverse();
      return ips;
    },
  })
  ips: ServiceIpAddress[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
