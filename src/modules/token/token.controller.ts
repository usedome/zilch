import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnguardedRoute } from 'src/utilities';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Post()
  @UnguardedRoute()
  @UseGuards(AuthGuard('google'))
  async create(@Req() req, @Res({ passthrough: true }) res) {
    const token = await this.tokenService.generate(req.user._id);
    res
      .status(201)
      .json({ user: req.user, token, message: 'token created successfully' });
  }
}
