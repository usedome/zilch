import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnguardedRoute } from 'src/utilities';

@Controller('token')
export class TokenController {
  @Post()
  @UnguardedRoute()
  @UseGuards(AuthGuard('google'))
  async create(@Req() req, @Res({ passthrough: true }) res) {}
}
