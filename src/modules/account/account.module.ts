import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { AccountStrategy } from './account.strategy';
import { AccountController } from './account.controller';

@Module({
  imports: [ConfigModule],
  providers: [AccountStrategy],
  controllers: [AccountController],
})
export class AccountModule {}
