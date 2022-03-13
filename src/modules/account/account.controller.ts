import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('accounts')
export class AccountController {
  @Get()
  @UseGuards(AuthGuard('google'))
  async access() {}
}
