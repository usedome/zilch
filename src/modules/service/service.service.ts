import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDocument } from './service.schema';
import { Model } from 'mongoose';
import { CreateServiceDto } from './dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private service: Model<ServiceDocument>,
  ) {}

  async create(dto: CreateServiceDto, user: string) {
    return await this.service.create({ ...dto, user });
  }

  async findOne(filter: { [key: string]: string }) {
    return await this.service.findOne({ ...filter });
  }

  async get(filter: { [key: string]: string }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const services = await this.service
      .find({ ...filter })
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
}
