import { Controller, Get, Put, Req, Body } from '@nestjs/common';
import { UpdateUserDto } from './dto';
import { UpdateUserPipe } from './pipes';
import { UserService } from './user.service';

@Controller('/me')
export class UserController {
  constructor(private userService: UserService) {}

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
