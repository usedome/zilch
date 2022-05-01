import { Controller, Get } from '@nestjs/common';
import { UnguardedRoute } from './utilities';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  @UnguardedRoute()
  getHello(): string {
    return 'Hello from the BackMeUp Index File';
  }
}
