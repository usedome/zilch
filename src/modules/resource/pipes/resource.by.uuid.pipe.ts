import { HttpStatus, Injectable, PipeTransform, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { handleException } from 'src/utilities';
import { ResourceService } from '../resource.service';

@Injectable()
export class ResourceByUuidPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private resourceService: ResourceService,
  ) {}

  async transform(uuid: string) {
    const resource = await this.resourceService.findOne({ uuid });

    if (!resource) {
      handleException(
        HttpStatus.NOT_FOUND,
        'resource-001',
        'resource does not exist',
      );
    }

    if (resource.service.uuid !== this.request.params.service_uuid) {
      handleException(
        HttpStatus.BAD_REQUEST,
        'resource-004',
        'resource does not belong to the specified service',
      );
    }

    if (
      resource.service.user._id.toString() !== this.request.user._id.toString()
    ) {
      handleException(
        HttpStatus.FORBIDDEN,
        'resource-002',
        'user lacks the required permissions',
      );
    }

    return resource;
  }
}
