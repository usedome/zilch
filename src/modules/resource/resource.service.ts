import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Resource, ResourceDocument } from './resource.schema';
import { Model, HydratedDocument } from 'mongoose';
import { CreateResourceDto, UpdateResourceDto } from './dto';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource.name) private resource: Model<ResourceDocument>,
  ) {}

  async create(dto: CreateResourceDto, service: string) {
    const resource = await this.resource.create({
      ...dto,
      service,
    });
    return resource;
  }

  async find(filter: { [key: string]: string }, cb?: any) {
    if (!cb) return await this.resource.find({ ...filter });
    return this.resource.find({ ...filter }, function (err, resources) {
      cb(resources);
    });
  }

  async findOne(filter: { [key: string]: string }) {
    return await this.resource.findOne({ ...filter });
  }

  async get(filter: { [key: string]: string }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const resources = await this.resource
      .find({ ...filter })
      .sort({ created_at: 'desc' })
      .skip(skip)
      .limit(limit);
    const pagination = await this.getPagination(filter, page, limit);
    return { resources, pagination };
  }

  async getPagination(
    filter: { [key: string]: string },
    page: number,
    limit: number,
  ) {
    const total = await this.resource.countDocuments(filter);
    const maxPages = Math.ceil(total / limit);
    return { currentPage: page, maxPages };
  }

  async update(resource: HydratedDocument<Resource>, dto: UpdateResourceDto) {
    Object.entries(dto).forEach(([key, value]) => {
      resource[key] = value;
    });

    await resource.save();
    return resource;
  }
}
