import { HttpStatus, Injectable, PipeTransform, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ServiceService } from 'src/modules/service/service.service';
import { throwException } from 'src/utilities';
import { ResourceService } from '../resource.service';

@Injectable()
export class ResourceByUuidPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private resourceService: ResourceService,
    private serviceService: ServiceService,
  ) {}

  async transform(uuid?: string) {
    if (!uuid) return undefined;

    if (this.request.params.service_uuid)
      return this.handleResourceRequest(uuid);

    return this.handleBackupRequest(uuid);
  }

  async handleResourceRequest(uuid: string) {
    const { params, user } = this.request;
    const service = await this.serviceService.findOne({
      uuid: params.service_uuid,
      user: user._id,
    });

    if (!service) {
      throwException(
        HttpStatus.NOT_FOUND,
        'service-001',
        'service does not exist',
      );
    }

    const resource = await this.resourceService.findOne({
      uuid,
      service: service._id,
    });

    if (!resource) {
      throwException(
        HttpStatus.NOT_FOUND,
        'resource-001',
        'resource does not exist',
      );
    }

    return resource;
  }

  async handleBackupRequest(uuid: string) {
    const { user } = this.request;
    const resource = await this.resourceService.findOne({ uuid });

    if (
      !resource ||
      resource.service.user._id.toString() !== user._id.toString()
    ) {
      throwException(
        HttpStatus.NOT_FOUND,
        'resource-001',
        'resource does not exist',
      );
    }

    return resource;
  }
}
