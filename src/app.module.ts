import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './modules/config/config.module';
import { ConfigService } from './modules/config/config.service';
import { UserModule } from './modules/user/user.module';
import { ServiceModule } from './modules/service/service.module';
import { BackupModule } from './modules/backup/backup.module';
import { ResourceModule } from './modules/resource/resource.module';
import { AccountModule } from './modules/account/account.module';
import { TokenModule } from './modules/token/token.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const { DB_USERNAME, DB_PASSWORD, DB_URL, DB_NAME } =
        configService.getAll();
      const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority`;
      return { uri };
      },
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UserModule,
    ServiceModule,
    BackupModule,
    ResourceModule,
    AccountModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
