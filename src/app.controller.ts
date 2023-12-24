import { Controller, Get, Post } from '@nestjs/common';
import { UnguardedAuthRoute } from './utilities';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  @UnguardedAuthRoute()
  getHello(): string {
    return 'Hello from the BackMeUp Index File';
  }

  @Post('/ping')
  @UnguardedAuthRoute()
  ping() {
    return { status: 'ok' };
  }
}
