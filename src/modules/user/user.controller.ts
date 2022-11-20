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
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
  InitiateAuthChangePipe,
  UserAuthChangePipe,
} from './pipes';
import { UserService } from './user.service';
import {
  UserAuthChangedEvent,
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

  @HttpCode(200)
  @Post('/auth/initiate-change')
  async initiateChangeAuth(
    @Req() req: Request & { user: HydratedDocument<User> },
    @Body(InitiateAuthChangePipe) body: ChangeAuthDto,
  ) {
    const auth_reset = {
      token: generateRandomToken(60),
      expires_in: Date.now() + 15 * 60 * 60 * 1000,
    };
    const { user } = req;
    if (body?.email) {
      user.password = await bcrypt.hash(body.password, 10);
      auth_reset['email'] = body.email;
    }

    user.auth_reset = auth_reset;
    await user.save();

    body?.email &&
      this.eventEmitter.emit(
        'user.confirm.email',
        new UserConfirmEmailEvent(user),
      );

    return {
      message: 'Authentication change initiated',
      token: user.auth_reset.token,
    };
  }

  @UnguardedAuthRoute()
  @UseGuards(AuthGuard('google'))
  @HttpCode(200)
  @Put('/auth/change/google')
  async changeAuthToGoogle(
    @Req() req,
    @Query('state', UserAuthChangePipe) token: string,
  ) {
    const {
      user: { email },
    } = req;
    const user = await this.userService.findOne({ 'auth_reset.token': token });
    user.email = email;
    user.auth_type = 'GOOGLE';
    user.auth_reset = undefined;
    await user.save();

    this.eventEmitter.emit('user.auth.changed', new UserAuthChangedEvent(user));
    return {
      user,
      message: 'Authentication method for user changed to Google',
    };
  }

  @HttpCode(200)
  @Put('/auth/change/:token')
  async changeAuthToEmail(
    @Req() req: Request & { user: HydratedDocument<User> },
    @Param('token', UserAuthChangePipe) _: string,
  ) {
    const { user } = req;
    user.email = user?.auth_reset?.email ?? user.email;
    user.auth_reset = undefined;
    user.auth_type = 'PASSWORD';
    await user.save();

    this.eventEmitter.emit('user.auth.changed', new UserAuthChangedEvent(user));
    return {
      user,
      message: 'Authentication method for user changed to email/password',
    };
  }
}
