import { Injectable, PipeTransform, Inject, HttpStatus } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { capitalize, throwException } from 'src/utilities';
import { CreateServiceDto } from '../dto';
import { ServiceService } from '../service.service';
import { HydratedDocument } from 'mongoose';
import { Service } from '../service.schema';

@Injectable()
export class EditServicePipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private serviceService: ServiceService,
  ) {}

  async transform(value: CreateServiceDto) {
    value.name = capitalize(value.name);
    const service = await this.serviceService.findOne({
      name: value.name,
      user: this.request.user._id,
    });

    if (this.request.method.toLowerCase() === 'post' && service)
      return this.handlePostMethod(value, service);

    return this.handlePutMethod(value, service);
  }

  handlePostMethod(
    value: CreateServiceDto,
    service?: HydratedDocument<Service>,
  ) {
    if (service) {
      throwException(
        HttpStatus.BAD_REQUEST,
        'service-003',
        `service exists with ${value.name} name for this user.`,
      );
    }
    return value;
  }

  handlePutMethod(
    value: CreateServiceDto,
    service?: HydratedDocument<Service>,
  ) {
    if (service && service.uuid !== this.request.params.uuid) {
      throwException(
        HttpStatus.BAD_REQUEST,
        'service-003',
        `different service exists with ${value.name} name for this user`,
      );
    }

    return value;
  }
}
