import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnguardedAuthRoute } from 'src/utilities';

@Controller('accounts')
export class AccountController {
  @Get()
  @UnguardedAuthRoute()
  @UseGuards(AuthGuard('google'))
  async access() {}
}
