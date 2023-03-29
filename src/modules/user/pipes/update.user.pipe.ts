import { HttpStatus, Injectable, PipeTransform, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ServiceService } from 'src/modules/service/service.service';
import { throwException } from 'src/utilities';
import { UpdateUserDto } from '../dto';

@Injectable()
export class UpdateUserPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private serviceService: ServiceService,
  ) {}

  async transform(value: any) {
    if (!value.default_service) return value;

    return this.validateDefaultService(value);
  }

  async validateDefaultService(value: UpdateUserDto) {
    const service = await this.serviceService.findOne({
      uuid: value.default_service,
    });

    const { user } = this.request;

    if (!service) {
      throwException(HttpStatus.NOT_FOUND, 'service-001', 'service not found');
    }

    if (service.user.toString() !== user._id.toString()) {
      throwException(
        HttpStatus.FORBIDDEN,
        'service-002',
        'service does not belong to current user',
      );
    }

    return { ...value, default_service: service._id };
  }
}
