import { Injectable, PipeTransform, Inject, HttpStatus } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { handleException } from 'src/utilities';
import { CreateServiceDto } from '../dto';
import { ServiceService } from '../service.service';

@Injectable()
export class CreateServicePipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private serviceService: ServiceService,
  ) {}

  async transform(value: CreateServiceDto) {
    value.name = value.name.toLowerCase();
    const service = await this.serviceService.findOne({
      name: value.name,
      user: this.request.user._id,
    });

    if (service) {
      handleException(
        HttpStatus.BAD_REQUEST,
        'service-001',
        `service exists with ${value.name} name for this user.`,
      );
    }

    return value;
  }
}
