import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  Inject,
  PipeTransform,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { throwException } from 'src/utilities';
import { UserService } from '../user.service';

@Injectable()
export class UserChangePipe implements PipeTransform {
  constructor(
    private userService: UserService,
    @Inject(REQUEST) private request,
  ) {}

  async transform(token: string, metadata: ArgumentMetadata) {
    if (metadata.data === 'password_reset_token')
      return this.validatePassword(token);
  }

  async validatePassword(token: string) {
    const user = await this.userService.findOne({
      'password_reset.token': token,
    });

    if (!user)
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-005',
        'Invalid password reset token',
      );

    if (user?.password_reset && user?.password_reset.expires_in <= Date.now())
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-005',
        'Expired password reset token',
      );

    return user;
  }
}
