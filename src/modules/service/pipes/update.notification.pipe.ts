import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { handleException } from 'src/utilities';
import { UpdateNotificationDto } from '../dto';

@Injectable()
export class UpdateNotificationPipe implements PipeTransform {
  async transform(value: UpdateNotificationDto) {
    const { key } = value;
    const validNotificationKeys = [
      'channels.email',
      'events.br_wrong_credentials',
      'events.br_unauthorized_ip',
      'events.br_successful',
    ];

    if (!validNotificationKeys.includes(key.toLowerCase()))
      handleException(
        HttpStatus.BAD_REQUEST,
        'service-001',
        'Invalid service notification key',
      );

    return { ...value, key: key.toLowerCase() };
  }
}
