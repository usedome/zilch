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

    return this.validateEmail(token);
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

  async validateEmail(token: string) {
    const user = await this.userService.findOne({
      'email_reset.token': token,
    });

    if (!user)
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-006',
        'Invalid email reset token',
      );

    if (user?.email_reset && user?.email_reset.expires_in <= Date.now())
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-006',
        'Expired email reset token',
      );

    const { body } = this.request;

    const userWithEmail = await this.userService.findOne({
      email: body?.email,
    });

    if (
      user.email === body?.email ||
      (userWithEmail &&
        userWithEmail.email.toLowerCase() !== user.email.toLowerCase())
    )
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-008',
        'User with email exists already',
      );
    return user;
  }
}
