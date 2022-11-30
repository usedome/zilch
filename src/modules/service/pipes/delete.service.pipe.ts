import { Injectable, PipeTransform, Inject, HttpStatus } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DeleteServiceDto } from '../dto';
import { Request } from 'express';
import { compare } from 'bcrypt';
import { User } from 'src/modules/user/user.schema';
import { throwException } from 'src/utilities';

@Injectable()
export class DeleteServicePipe implements PipeTransform {
  constructor(@Inject(REQUEST) private request: Request & { user: User }) {}

  async transform(dto: DeleteServiceDto) {
    const { password } = dto;
    const { user } = this.request;

    if (!(await compare(password, user.password)))
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-008',
        'Password is incorrect',
      );

    return dto;
  }
}
