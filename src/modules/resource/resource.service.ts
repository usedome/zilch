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

  async find(filter: { [key: string]: any }) {
    return await this.resource.find({ ...filter }).sort({ created_at: -1 });
  }

  async findOne(filter: { [key: string]: string }) {
    return await this.resource.findOne({ ...filter });
  }

  async get(filter: { [key: string]: any }, count: number) {
    return await this.resource
      .find({ ...filter })
      .sort({ created_at: 'desc' })
      .limit(count);
  }

  async count(filter: { [key: string]: any }) {
    return await this.resource.countDocuments({ ...filter });
  }

  async update(resource: HydratedDocument<Resource>, dto: UpdateResourceDto) {
    Object.entries(dto).forEach(([key, value]) => {
      resource[key] = value;
    });

    await resource.save();
    return resource;
  }

  async deleteMany(filter: { [key: string]: any }) {
    await this.resource.deleteMany({ ...filter });
  }
}
