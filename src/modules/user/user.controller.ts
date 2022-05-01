import { Controller, Get, Req } from '@nestjs/common';

@Controller('')
export class UserController {
  @Get('/me')
  async getMe(@Req() req) {
    const { user } = req;
    return { user, message: 'user fetched successfully' };
  }
}
