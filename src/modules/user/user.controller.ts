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
import {
  ChangePasswordDto,
  CreateUserDto,
  ResetEmailDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto';
import {
  ChangePasswordPipe,
  CreateUserPipe,
  UserResetPipe,
  UpdateUserPipe,
  VerifyUserPipe,
} from './pipes';
import { UserService } from './user.service';
import { UserRegisteredEvent, UserResetPasswordEvent } from './events';
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
    res.status(200).json({ message: 'user verified successfully', user });
  }

  @Get()
  async getMe(@Req() req) {
    const { user } = req;
    return { user, message: 'user fetched successfully' };
  }

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

  @UnguardedAuthRoute()
  @Put('/password/change/:token')
  @HttpCode(200)
  async changePassword(
    @Param('token', ChangePasswordPipe) user: HydratedDocument<User>,
    @Body() body: ChangePasswordDto,
  ) {
    user.password = await bcrypt.hash(body.password, 10);
    user.password_reset = undefined;
    await user.save();
    return { message: 'user updated successfully', user };
  }

  @Post('/email/reset')
  async resetEmail(@Req() req, @Body() dto: ResetEmailDto) {
    const { user }: Request & { user: HydratedDocument<User> } = req;
  }
}
