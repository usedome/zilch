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
import { FormDataRequest } from 'nestjs-form-data';
import {
  ChangeEmailDto,
  ChangePasswordDto,
  CreateUserDto,
  ResetEmailDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto';
import {
  UserChangePipe,
  CreateUserPipe,
  UserResetPipe,
  UpdateUserPipe,
  VerifyUserPipe,
} from './pipes';
import { UserService } from './user.service';
import {
  UserEmailChangedEvent,
  UserEmailVerifiedEvent,
  UserRegisteredEvent,
  UserResetEmailEvent,
  UserResetEmailVerifyEvent,
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
    const user = await this.userService.create(body);
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

  @Post('/email/reset')
  @HttpCode(200)
  async resetEmail(@Req() req, @Body(UserResetPipe) dto: ResetEmailDto) {
    const { user }: Request & { user: HydratedDocument<User> } = req;
    user.email_reset = {
      token: generateRandomToken(60),
      expires_in: Date.now() + 15 * 60 * 60 * 1000,
    };
    await user.save();
    this.eventEmitter.emit('user.reset.email', new UserResetEmailEvent(user));
    return { message: 'Email reset mail sent successfully' };
  }

  @UnguardedAuthRoute()
  @Post('/email/verify/:email_reset_token')
  @HttpCode(200)
  async verifyEmail(
    @Param('email_reset_token', UserChangePipe) user: HydratedDocument<User>,
    @Body() dto: ChangeEmailDto,
  ) {
    user.email_reset = {
      token: generateRandomToken(60),
      expires_in: Date.now() + 15 * 60 * 60 * 1000,
      email: dto.email,
    };
    await user.save();
    this.eventEmitter.emit(
      'user.reset.email.verify',
      new UserResetEmailVerifyEvent(user, dto.email),
    );
    return { message: 'Email verification mail sent successfully' };
  }

  @UnguardedAuthRoute()
  @Put('/email/change/:email_reset_token')
  @HttpCode(200)
  async changeEmail(
    @Param('email_reset_token', UserChangePipe) user: HydratedDocument<User>,
  ) {
    const email = user.email_reset?.email as string;
    user.email = email ?? user.email;
    user.email_reset = undefined;
    await user.save();
    this.eventEmitter.emit(
      'user.email.changed',
      new UserEmailChangedEvent(user),
    );
    return { user, message: 'User email changed successfully' };
  }
}
