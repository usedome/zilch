import {
  Controller,
  Get,
  Put,
  Req,
  Param,
  Body,
  Post,
  Res,
  HttpCode,
} from '@nestjs/common';
import { generateRandomToken, UnguardedAuthRoute } from 'src/utilities';
import { EventEmitter2 } from 'eventemitter2';
import * as bcrypt from 'bcrypt';
import { HydratedDocument } from 'mongoose';
import { Request } from 'express';
import { FormDataRequest } from 'nestjs-form-data';
import {
  ChangeAuthDto,
  ChangeEmailDto,
  ChangePasswordDto,
  CreateUserDto,
  ResetEmailDto,
  ResetPasswordDto,
  UpdateUserDto,
  UseEmailPasswordAuthDto,
  UseGoogleAuthDto,
} from './dto';
import {
  UserChangePipe,
  CreateUserPipe,
  UserResetPipe,
  UpdateUserPipe,
  VerifyUserPipe,
  ChangeUserAuthPipe,
} from './pipes';
import { UserService } from './user.service';
import {
  UserConfirmEmailEvent,
  UserEmailVerifiedEvent,
  UserRegisteredEvent,
  UserResetPasswordEvent,
} from './events';
import { TokenService } from '../token/token.service';
import { User } from './user.schema';

@Controller('/me')
export class UserController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private eventEmitter: EventEmitter2,
  ) {}

  @UnguardedAuthRoute()
  @Post()
  async createMe(
    @Res({ passthrough: true }) res,
    @Body(CreateUserPipe) body: CreateUserDto,
  ) {
    const user = await this.userService.create({
      ...body,
      auth_type: 'PASSWORD',
    });
    const token = await this.tokenService.generate(user._id);
    this.eventEmitter.emit('user.registered', new UserRegisteredEvent(user));
    res.status(201).json({ user, token, message: 'user created successfully' });
  }

  @Post('/verification-email/send')
  async resendVerificationEmail(@Req() req, @Res({ passthrough: true }) res) {
    const { user } = req;
    user.email_verification_token = generateRandomToken(60);
    await user.save();
    this.eventEmitter.emit('user.registered', new UserRegisteredEvent(user));
    res.status(200).json({ message: 'verification email sent successfully' });
  }

  @UnguardedAuthRoute()
  @Post('/verify/:token')
  async verifyMe(
    @Param('token', VerifyUserPipe) user: HydratedDocument<User>,
    @Res({ passthrough: true }) res,
  ) {
    user.email_verification_token = undefined;
    await user.save();
    this.eventEmitter.emit(
      'user.email.verified',
      new UserEmailVerifiedEvent(user),
    );
    res.status(200).json({ message: 'user verified successfully', user });
  }

  @Get()
  async getMe(@Req() req) {
    const { user } = req;
    return { user, message: 'user fetched successfully' };
  }

  @FormDataRequest()
  @Put()
  async updateMe(@Req() req, @Body(UpdateUserPipe) body: UpdateUserDto) {
    const { user } = req;
    const updatedUser = await this.userService.update(user, body);
    return {
      user: updatedUser,
      message: 'user updated successfully',
    };
  }

  @UnguardedAuthRoute()
  @Post('/password/reset')
  @HttpCode(200)
  async resetPassword(@Body(UserResetPipe) dto: ResetPasswordDto) {
    const user = await this.userService.findOne({ email: dto.email });
    user.password_reset = {
      token: generateRandomToken(60),
      expires_in: Date.now() + 15 * 60 * 60 * 1000,
    };
    await user.save();
    this.eventEmitter.emit(
      'user.reset.password',
      new UserResetPasswordEvent(user),
    );
    return { message: 'Password reset email sent successfully' };
  }

  @Put('/password/change')
  @HttpCode(200)
  async changePasswordAuth(@Body() body: ChangePasswordDto, @Req() req) {
    const { user } = req;
    user.password = await bcrypt.hash(body.password, 10);
    await user.save();
    return { message: 'Password changed successfully', user };
  }

  @UnguardedAuthRoute()
  @Put('/password/change/:password_reset_token')
  @HttpCode(200)
  async changePassword(
    @Param('password_reset_token', UserChangePipe)
    user: HydratedDocument<User>,
    @Body() body: ChangePasswordDto,
  ) {
    user.password = await bcrypt.hash(body.password, 10);
    user.password_reset = undefined;
    await user.save();
    return { message: 'Password changed successfully', user };
  }

  @Post('/auth/change/initiate')
  async initiateChangeAuth(
    @Req() req: Request & { user: HydratedDocument<User> },
    @Body(ChangeUserAuthPipe) body: ChangeAuthDto,
  ) {
    if (!body?.email) return { message: 'Password verified successfully' };
    const { user } = req;
    user.password = await bcrypt.hash(body.password, 10);
    user.auth_reset = {
      email: body.email,
      token: generateRandomToken(60),
      expires_in: Date.now() + 15 * 60 * 60 * 1000,
    };
    await user.save();
    this.eventEmitter.emit(
      'user.confirm.email',
      new UserConfirmEmailEvent(user),
    );

    return { message: 'Auth change confirmation email sent successfully' };
  }
}
