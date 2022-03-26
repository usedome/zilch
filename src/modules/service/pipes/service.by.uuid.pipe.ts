import { HttpStatus, Injectable, PipeTransform, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { handleException } from 'src/utilities';
import { ServiceService } from '../service.service';

@Injectable()
export class ServiceByUuidPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private serviceService: ServiceService,
  ) {}

  async transform(uuid: string) {
    const service = await this.serviceService.findOne({ uuid });

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

    return service;
  }
}
