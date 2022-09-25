import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { CreateTokenDto } from '../dto';
import { compare } from 'bcrypt';
import { throwException } from 'src/utilities';

@Injectable()
export class CreateTokenPipe implements PipeTransform {
  constructor(private userService: UserService) {}

  async transform(dto: CreateTokenDto) {
    const user = await this.userService.findOne({ email: dto.email });

    if (!user || !(await compare(dto.password, user.password)))
      throwException(HttpStatus.NOT_FOUND, 'user-001', 'User does not exist');

    return dto;
  }
}
