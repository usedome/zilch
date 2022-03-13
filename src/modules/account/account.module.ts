import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { AccountStrategy } from './account.strategy';
import { AccountController } from './account.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ConfigModule, UserModule],
  providers: [AccountStrategy],
  controllers: [AccountController],
})
export class AccountModule {}
