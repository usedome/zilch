import { Controller, Post, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnguardedRoute } from 'src/utilities';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Get()
  @UnguardedRoute()
  @UseGuards(AuthGuard('google'))
  async create(@Req() req, @Res({ passthrough: true }) res) {
    // const token = await this.tokenService.
    return req.user;
  }
}
