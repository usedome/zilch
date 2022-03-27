import { Injectable, PipeTransform, HttpStatus, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ServiceService } from 'src/modules/service/service.service';
import { handleException } from 'src/utilities';
import { CreateResourceDto, UpdateResourceDto } from '../dto';
import { ResourceService } from '../resource.service';
import { HydratedDocument } from 'mongoose';
import { Resource } from '../resource.schema';
import { Service } from 'src/modules/service/service.schema';

@Injectable()
export class EditResourcePipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private resourceService: ResourceService,
    private serviceService: ServiceService,
  ) {}

  async transform(value: CreateResourceDto | UpdateResourceDto) {
    const service = await this.serviceService.findOne({
      uuid: this.request.params.service_uuid,
    });

    if (!service) {
      handleException(HttpStatus.NOT_FOUND, 'service-001', 'service not found');
    }

    if (service.user._id.toString() !== this.request.user._id.toString()) {
      handleException(
        HttpStatus.FORBIDDEN,
        'service-002',
        'user lacks the required permissions',
      );
    }

    let resource;

    if (value.name) {
      value.name = value.name.toLowerCase();
      resource = await this.resourceService.findOne({
        name: value.name,
        service: service._id,
      });
    }

    if (this.request.method.toLowerCase() === 'post')
      return this.handlePostMethod(
        value as CreateResourceDto,
        service,
        resource,
      );

    return this.handlePutMethod(value as UpdateResourceDto, service, resource);
  }

  handlePostMethod(
    value: CreateResourceDto,
    service: HydratedDocument<Service>,
    resource?: HydratedDocument<Resource>,
  ) {
    if (resource) {
      handleException(
        HttpStatus.BAD_REQUEST,
        'resource-003',
        `resource with ${value.name} name exists already for ${service.name} service`,
      );
    }

    return value;
  }

  handlePutMethod(
    value: UpdateResourceDto,
    service: HydratedDocument<Service>,
    resource?: HydratedDocument<Resource>,
  ) {
    if (value.name) {
      if (resource && resource.uuid !== this.request.params.resource_uuid) {
        handleException(
          HttpStatus.BAD_REQUEST,
          'resource-003',
          `resource with ${value.name} name exists already for ${service.name} service`,
        );
      }
    }
    return value;
  }
}
