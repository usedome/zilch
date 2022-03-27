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
  Put,
} from '@nestjs/common';
import { Service } from '../service/service.schema';
import {
  CreateResourceDto,
  EditResourcePipeDto,
  UpdateResourceDto,
} from './dto';
import { EditResourcePipe } from './pipes';
import { HydratedDocument } from 'mongoose';
import { ResourceService } from './resource.service';
import { ServiceByUuidPipe } from '../service/pipes/service.by.uuid.pipe';
import { Resource } from './resource.schema';
import { ResourceByUuidPipe } from './pipes/resource.by.uuid.pipe';

@Controller('/services/:service_uuid/resources')
export class ResourceController {
  constructor(private resourceService: ResourceService) {}

  @Post()
  async create(
    @Body(EditResourcePipe)
    { body, service }: any,
    @Res({ passthrough: true }) res,
  ) {
    const _id = String((service as HydratedDocument<Service>)._id);
    const resource = await this.resourceService.create(
      body as CreateResourceDto,
      _id,
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

  @Get('/:resource_uuid')
  async getOne(
    @Param('resource_uuid', ResourceByUuidPipe)
    resource: HydratedDocument<Resource>,
  ) {
    return { resource, message: 'resource fetched successfully' };
  }

  @Put('/:resource_uuid')
  async update(@Body(EditResourcePipe) { body, resource }: any) {
    const updatedResource = await this.resourceService.update(resource, body);
    return {
      resource: updatedResource,
      message: 'resource updated successfully',
    };
  }
}
