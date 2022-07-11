import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsDefined, IsString } from 'class-validator';
import { Schema as MongooseSchema, Document } from 'mongoose';
import { User } from '../user/user.schema';

export type ServiceDocument = Service & Document;

export class ServiceApiKey {
  name: string;
  uuid: string;
  key: string;
  last_used: Date | null;
}

export class ServiceIpAddress {
  uuid: string;
  value: string;
  last_used?: Date | null;
}

export class ServiceNotification {
  channels: string[];
  events: { [key: string]: boolean };
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

  @Prop({ type: String, default: '1w' })
  backup_duration: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    get: (api_keys) => {
      if (!api_keys) return [];
      api_keys.reverse();
      return api_keys;
    },
    default: [],
  })
  api_keys: ServiceApiKey[];

  @Prop({
    type: MongooseSchema.Types.Mixed,
    get: (ips) => {
      if (!ips) return [];
      ips.reverse();
      return ips;
    },
    default: [],
  })
  ips: ServiceIpAddress[];

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: () => ({
      channels: ['EMAIL'],
      events: {
        BR_WRONG_CREDENTIALS: true,
        BR_UNAUTHORIZED_IP: true,
        BR_SUCCESSFUL: true,
      },
    }),
  })
  notifications: ServiceNotification;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
