import { Injectable, PipeTransform, HttpStatus } from '@nestjs/common';
import { throwException } from 'src/utilities';
import { UserService } from '../user.service';

@Injectable()
export class VerifyUserPipe implements PipeTransform {
  constructor(private userService: UserService) {}

  async transform(token: string) {
    const user = await this.userService.findOne({
      email_verification_token: token,
    });

    if (!user)
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-004',
        'invalid email verification token',
      );

    return user;
  }
}
