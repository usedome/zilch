import {
  Body,
  Controller,
  Post,
  Get,
  Res,
  Req,
  Delete,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { Service } from '../service/service.schema';
import { CreateResourceDto } from './dto';
import { EditResourcePipe } from './pipes';
import { HydratedDocument } from 'mongoose';
import { ResourceService } from './resource.service';
import { ServiceByUuidPipe } from '../service/pipes/service.by.uuid.pipe';
import { Resource } from './resource.schema';
import { ResourceByUuidPipe } from './pipes/resource.by.uuid.pipe';
import { BackupService } from '../backup/backup.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { ConfigService } from '../config/config.service';
import { throwException } from 'src/utilities';

@Controller('/services/:service_uuid/resources')
export class ResourceController {
  constructor(
    private resourceService: ResourceService,
    private backupService: BackupService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

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
    @Query('count', new DefaultValuePipe(12), ParseIntPipe) count: number,
    @Query('after_uuid', ResourceByUuidPipe)
    resource?: HydratedDocument<Resource>,
  ) {
    const filter = resource
      ? {
          service: service._id,
          created_at: { $lt: resource.created_at },
        }
      : {
          service: service._id,
        };

    const resources = await this.resourceService.get({ ...filter }, count);

    const hasMoreResources =
      resources.length === 0
        ? false
        : Boolean(
            await this.resourceService.count({
              ...filter,
              created_at: { $lt: resources[0].created_at },
            }),
          );

    return {
      resources,
      hasMoreResources,
      message: 'resources fetched successfully',
    };
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

  @Delete('/:resource_uuid')
  async deleteResource(
    @Param('resource_uuid', ResourceByUuidPipe)
    resource: HydratedDocument<Resource>,
    @Req() request: Request,
    @Res({ passthrough: true }) res,
  ) {
    const { headers } = request;
    const backupCount = await this.backupService.count({
      resource: resource._id,
    });

    if (backupCount > 0) {
      try {
        const url =
          this.configService.get('DURAN_API_URL') +
          `/resources/${resource.uuid}`;
        await firstValueFrom(
          this.httpService.delete(url, {
            headers: { authorization: headers?.authorization ?? '' },
          }),
        );
        await this.backupService.deleteMany({ resource: resource._id });
      } catch (error) {
        throwException(
          HttpStatus.BAD_GATEWAY,
          'resource-002',
          `there was a problem deleting the resource with uuid ${resource.uuid}`,
        );
      }
    }

    await resource.delete();
    res.status(204);
  }
}
