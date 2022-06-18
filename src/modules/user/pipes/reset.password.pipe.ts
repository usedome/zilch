import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { throwException } from 'src/utilities';
import { ResetPasswordDto } from '../dto';
import { UserService } from '../user.service';

@Injectable()
export class ResetPasswordPipe implements PipeTransform {
  constructor(private userService: UserService) {}

  async transform(value: ResetPasswordDto) {
    const user = await this.userService.findOne({ email: value.email });

    if (!user) {
      throwException(
        HttpStatus.OK,
        '',
        'Password reset email sent successfully',
      );
    }

    return value;
  }
}
