import {
  Body,
  Controller,
  Post,
  Get,
  Res,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Service } from '../service/service.schema';
import { CreateResourceDto } from './dto';
import { EditResourcePipe } from './pipes';
import { HydratedDocument } from 'mongoose';
import { ResourceService } from './resource.service';
import { ServiceByUuidPipe } from '../service/pipes/service.by.uuid.pipe';

@Controller('/services/:service_uuid/resources')
export class ResourceController {
  constructor(private resourceService: ResourceService) {}

  @Post()
  async create(
    @Param('service_uuid', ServiceByUuidPipe)
    service: HydratedDocument<Service>,
    @Body(EditResourcePipe)
    body: CreateResourceDto,
    @Res({ passthrough: true }) res,
  ) {
    const resource = await this.resourceService.create(
      body,
      String(service._id),
    );
    res
      .status(201)
      .json({ resource, message: 'resource created successfully' });
  }

  @Get()
  async get(
    @Param('service_uuid', ServiceByUuidPipe)
    service: HydratedDocument<Service>,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('count', new DefaultValuePipe(8), ParseIntPipe) count: number,
  ) {
    const { resources, pagination } = await this.resourceService.get(
      { service: String(service._id) },
      page,
      count,
    );

    return { resources, pagination, message: 'resources fetched successfully' };
  }
}
