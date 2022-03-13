import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnguardedRoute } from 'src/utilities';

@Controller('accounts')
export class AccountController {
  @Get()
  @UnguardedRoute()
  @UseGuards(AuthGuard('google'))
  async access() {}
}
