import { Injectable, PipeTransform, Inject, HttpStatus } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { HydratedDocument } from 'mongoose';
import { Request } from 'express';
import { compare } from 'bcrypt';
import { UseEmailPasswordAuthDto, UseGoogleAuthDto } from '../dto';
import { User } from '../user.schema';
import { throwException } from 'src/utilities';
import { UserService } from '../user.service';

@Injectable()
export class ChangeUserAuthPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST)
    private request: Request & { user: HydratedDocument<User> },
    private userService: UserService,
  ) {}

  async transform(dto: UseGoogleAuthDto | UseEmailPasswordAuthDto) {
    if ((dto as UseEmailPasswordAuthDto)?.email)
      return this.validateEmailPasswordAuth(dto as UseEmailPasswordAuthDto);

    return this.validateGoogleAuth(dto as UseGoogleAuthDto);
  }

  async validateGoogleAuth(dto: UseGoogleAuthDto) {
    const { user } = this.request;
    if (user.auth_type === 'GOOGLE')
      throwException(
        HttpStatus.BAD_REQUEST,
        '',
        "user's authentication method is already google",
      );

    if (!(await compare(dto.password, user.password)))
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-008',
        'Password is incorrect',
      );

    return dto;
  }

  async validateEmailPasswordAuth(dto: UseEmailPasswordAuthDto) {
    const { user } = this.request;
    if (user.auth_type === 'PASSWORD')
      throwException(
        HttpStatus.BAD_REQUEST,
        '',
        "user's authentication method is already email/password",
      );

    const userWithEmail = await this.userService.findOne({ email: dto.email });

    if (userWithEmail && userWithEmail._id.toString() !== user._id.toString())
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-003',
        `user with email ${dto.email} exists already`,
      );

    return dto;
  }
}
