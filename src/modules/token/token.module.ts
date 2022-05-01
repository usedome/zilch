import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { UserModule } from '../user/user.module';
import { TokenController } from './token.controller';
import { TokenGuard } from './token.guard';
import { TokenService } from './token.service';
import { TokenStrategy } from './token.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '3d' },
        };
      },
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    ConfigModule,
    UserModule,
  ],
  controllers: [TokenController],
  providers: [
    TokenService,
    TokenStrategy,
    { provide: APP_GUARD, useClass: TokenGuard },
  ],
})
export class TokenModule {}
