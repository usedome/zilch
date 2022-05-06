import { Controller, Get, Put, Req, Body, Post, Res } from '@nestjs/common';
import { UnguardedAuthRoute } from 'src/utilities';
import { CreateUserDto, UpdateUserDto } from './dto';
import { CreateUserPipe, UpdateUserPipe } from './pipes';
import { UserService } from './user.service';

@Controller('/me')
export class UserController {
  constructor(private userService: UserService) {}

  @UnguardedAuthRoute()
  @Post()
  async createMe(
    @Res({ passthrough: true }) res,
    @Body(CreateUserPipe) body: CreateUserDto,
  ) {
    const user = await this.userService.create(body);
    res.status(201).json({ user, message: 'user created successfully' });
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
}
