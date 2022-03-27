import { Injectable, PipeTransform, HttpStatus, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ServiceService } from 'src/modules/service/service.service';
import { handleException } from 'src/utilities';
import { CreateResourceDto } from '../dto';
import { ResourceService } from '../resource.service';

@Injectable()
export class EditResourcePipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private resourceService: ResourceService,
    private serviceService: ServiceService,
  ) {}

  async transform(value: CreateResourceDto) {
    value.name = value.name.toLowerCase();
    const service = await this.serviceService.findOne({
      uuid: this.request.params.service_uuid,
    });

    if (!service) {
      handleException(HttpStatus.NOT_FOUND, 'service-001', 'service not found');
    }

    const resource = await this.resourceService.findOne({
      name: value.name,
      service: service._id,
    });

    if (resource) {
      handleException(
        HttpStatus.BAD_REQUEST,
        'resource-003',
        `resource with ${value.name} name exists already for ${service.name} name`,
      );
    }

    return value;
  }
}
