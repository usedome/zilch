import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '../config/config.module';
import { UserModule } from '../user/user.module';
import { TokenController } from './token.controller';
import { TokenGuard } from './token.guard';
import { TokenService } from './token.service';
import { TokenStrategy } from './token.strategy';

@Module({
  imports: [ConfigModule, UserModule],
  controllers: [TokenController],
  providers: [
    TokenService,
    TokenStrategy,
    { provide: APP_GUARD, useClass: TokenGuard },
  ],
})
export class TokenModule {}
