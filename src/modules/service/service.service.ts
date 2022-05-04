import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Service, ServiceDocument } from './service.schema';
import { Model, HydratedDocument } from 'mongoose';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { capitalize, generateApiKey } from 'src/utilities';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private service: Model<ServiceDocument>,
  ) {}

  async create(dto: CreateServiceDto, user: string) {
    return await this.service.create({ ...dto, api_keys: [], user });
  }

  async findOne(filter: { [key: string]: string }) {
    return await this.service.findOne({ ...filter });
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
    Object.entries(dto).forEach(([key, value]) => {
      service[key] = value;
    });
    await service.save();
    return service;
  }

  async createApiKey(service: HydratedDocument<Service>, name: string) {
    const newApiKey = {
      name: capitalize(name),
      uuid: uuidv4(),
      key: generateApiKey(),
      last_used: null,
    };
    service.api_keys = [...(service.api_keys ?? []), newApiKey];
    await service.save();
    return service;
  }

  async deleteApiKey(service: HydratedDocument<Service>, api_key_uuid: string) {
    service.api_keys = service.api_keys.filter(
      ({ uuid }) => uuid != api_key_uuid,
    );
    await service.save();
    return service;
  }
}
