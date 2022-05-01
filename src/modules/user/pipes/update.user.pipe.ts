import { HttpStatus, Injectable, PipeTransform, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ServiceService } from 'src/modules/service/service.service';
import { handleException } from 'src/utilities';
import { UpdateUserDto } from '../dto';

@Injectable()
export class UpdateUserPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private serviceService: ServiceService,
  ) {}

  async transform(value: UpdateUserDto) {
    if (!value.active_service) return value;

    const service = await this.serviceService.findOne({
      uuid: value.active_service,
    });

    const { user } = this.request;

    if (!service) {
      handleException(HttpStatus.NOT_FOUND, 'service-001', 'service not found');
    }

    if (service.user.toString() !== user._id.toString()) {
      handleException(
        HttpStatus.FORBIDDEN,
        'service-002',
        'service does not belong to current user',
      );
    }

    return value;
  }
}
