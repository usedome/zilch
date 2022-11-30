import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Service, ServiceDocument } from './service.schema';
import { Model, HydratedDocument } from 'mongoose';
import {
  CreateServiceDto,
  UpdateNotificationDto,
  UpdateServiceDto,
} from './dto';
import { capitalize, generateApiKey } from 'src/utilities';
import { ResourceService } from '../resource/resource.service';
import { BackupService } from '../backup/backup.service';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private service: Model<ServiceDocument>,
    private resourceService: ResourceService,
    private backupService: BackupService,
  ) {}

  async create(dto: CreateServiceDto, user: string) {
    return await this.service.create({ ...dto, user });
  }

  async findOne(filter: { [key: string]: string }) {
    return await await this.service.findOne({ ...filter });
  }

  async get(filter: { [key: string]: string }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const services = await this.service
      .find({ ...filter })
      .sort({ created_at: 'desc' })
      .skip(skip)
      .limit(limit);
    const pagination = await this.getPagination(filter, page, limit);
    return { services, pagination };
  }

  async getPagination(
    filter: { [key: string]: string },
    page: number,
    limit: number,
  ) {
    const total = await this.service.countDocuments(filter);
    const maxPages = Math.ceil(total / limit);
    return { currentPage: page, maxPages };
  }

  async update(service: HydratedDocument<Service>, dto: UpdateServiceDto) {
    if (dto?.auth_enabled !== undefined) {
      service.auth = { ...service.auth, is_enabled: dto.auth_enabled };
      delete dto?.auth_enabled;
    }

    if (dto?.ip_whitelist_enabled !== undefined) {
      service.ip_whitelist = {
        ...service.ip_whitelist,
        is_enabled: dto.ip_whitelist_enabled,
      };
      delete dto?.ip_whitelist_enabled;
    }

    Object.entries(dto).forEach(([key, value]) => {
      service[key] = value;
    });
    await service.save();
    return service;
  }

  async delete(service: HydratedDocument<Service>) {
    const resources = await this.resourceService.find({ service: service._id });
    const resourceIds = resources.map(({ _id }) => _id);
    await this.backupService.deleteMany({
      resource: { $in: resourceIds },
    });
    await this.resourceService.deleteMany({ service: service._id });
    await service.delete();
  }

  async createApiKey(service: HydratedDocument<Service>, name: string) {
    const newApiKey = {
      name: capitalize(name),
      uuid: uuidv4(),
      key: generateApiKey(),
      last_used: null,
    };
    const {
      auth: { api_keys },
    } = service;
    service.auth = {
      ...service.auth,
      api_keys: [...(api_keys ?? []), newApiKey],
    };
    await service.save();
    return service;
  }

  async deleteApiKey(service: HydratedDocument<Service>, api_key_uuid: string) {
    const {
      auth: { api_keys },
    } = service;
    service.auth.api_keys = api_keys.filter(({ uuid }) => uuid != api_key_uuid);
    service.markModified('auth');
    await service.save();
    return service;
  }

  async createIpAddress(service: HydratedDocument<Service>, value: string) {
    const newIpAddress = { uuid: uuidv4(), value };
    const {
      ip_whitelist: { ips },
    } = service;
    service.ip_whitelist = {
      ...service.ip_whitelist,
      ips: [...(ips ?? []), newIpAddress],
    };
    await service.save();
    return service;
  }

  async deleteIpAddress(
    service: HydratedDocument<Service>,
    ip_address_uuid: string,
  ) {
    const {
      ip_whitelist: { ips },
    } = service;
    service.ip_whitelist.ips = (ips ?? []).filter(
      ({ uuid }) => uuid !== ip_address_uuid,
    );
    service.markModified('ip_whitelist');
    await service.save();
    return service;
  }

  async updateNotifications(
    service: HydratedDocument<Service>,
    body: UpdateNotificationDto,
  ) {
    const [key, subKey] = body.key.split('.');
    const notifications = service.notifications;

    if (key === 'channel') {
      if (!body.value) {
        const idx = notifications.channels.findIndex(
          (channel) => channel.toUpperCase() === subKey.toUpperCase(),
        );
        if (idx === -1) return service;
        notifications.channels.splice(idx, 1);
      } else notifications.channels.push(subKey.toUpperCase());
      service.notifications = {
        ...notifications,
        channels: [...new Set(notifications.channels)],
      };
    } else {
      service.notifications = {
        ...notifications,
        events: { ...notifications.events, [subKey.toUpperCase()]: body.value },
      };
    }

    await service.save();
    return service;
  }
}
