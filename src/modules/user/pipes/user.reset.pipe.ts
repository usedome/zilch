import { HttpStatus, Injectable, Inject, PipeTransform } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { throwException } from 'src/utilities';
import { ResetEmailDto, ResetPasswordDto } from '../dto';
import { UserService } from '../user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserResetPipe implements PipeTransform {
  constructor(
    private userService: UserService,
    @Inject(REQUEST) private request,
  ) {}

  async transform(dto: ResetPasswordDto | ResetEmailDto) {
    if ((dto as ResetPasswordDto).email)
      return this.validateResetPassword(dto as ResetPasswordDto);
    return this.validateResetEmail(dto as ResetEmailDto);
  }

  async validateResetPassword(dto: ResetPasswordDto) {
    const user = await this.userService.findOne({ email: dto.email });

    if (!user) {
      throwException(
        HttpStatus.OK,
        '',
        'Password reset email sent successfully',
      );
    }

    return dto;
  }

  async validateResetEmail(dto: ResetEmailDto) {
    const { user } = this.request;
    if (!(await bcrypt.compare(dto.password, user.password)))
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-007',
        'Password is incorrect',
      );
    return dto;
  }
}
