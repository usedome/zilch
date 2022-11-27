import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { throwException } from 'src/utilities';
import { UserService } from '../user.service';

@Injectable()
export class UserAuthChangePipe implements PipeTransform {
  constructor(private userService: UserService) {}

  async transform(token: string) {
    const tokenSplits = token.split('.');
    const parsedToken =
      tokenSplits.length > 1 ? tokenSplits[1] : tokenSplits[0];

    const user = await this.userService.findOne({
      'auth_reset.token': parsedToken,
    });

    if (!user)
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-009',
        'Invalid authentication reset token',
      );

    if (user?.auth_reset?.expires_in < Date.now())
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-0010',
        'Expired authentication reset token',
      );

    return user;
  }
}
