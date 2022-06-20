import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { throwException } from 'src/utilities';
import { UserService } from '../user.service';

@Injectable()
export class ChangePasswordPipe implements PipeTransform {
  constructor(private userService: UserService) {}

  async transform(token: string) {
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
