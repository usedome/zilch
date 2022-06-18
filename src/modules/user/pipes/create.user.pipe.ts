import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { throwException } from 'src/utilities';
import { CreateUserDto } from '../dto';
import { UserService } from '../user.service';

@Injectable()
export class CreateUserPipe implements PipeTransform {
  constructor(private userService: UserService) {}

  async transform(value: CreateUserDto) {
    const { email } = value;
    const user = await this.userService.findOne({ email });

    if (user) {
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-003',
        `user with email ${email} exists already`,
      );
    }

    return value;
  }
}
