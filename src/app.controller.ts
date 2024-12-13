import { Controller, Post, HttpCode } from '@nestjs/common';
import { UnguardedAuthRoute } from './utilities';
import { ResourceService } from './modules/resource/resource.service';

@Controller()
export class AppController {
  constructor(private resourceService: ResourceService) {}

  @Post('/ping')
  @UnguardedAuthRoute()
  @HttpCode(200)
  async ping() {
    try {
      await this.resourceService.findOne({ uuid: 'some-random-uuid' });
      return { database: 'healthy' };
    } catch (error) {
      return { database: 'unhealthy' };
    }
  }
}
