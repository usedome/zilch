import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { GoogleAccountStrategy } from './google.account.strategy';
import { AccountController } from './account.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ConfigModule, UserModule],
  providers: [GoogleAccountStrategy],
  controllers: [AccountController],
})
export class AccountModule {}
