import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { servicePlugin, uuidPlugin } from 'src/utilities';
import { Service, ServiceSchema } from './service.schema';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { UserModule } from '../user/user.module';
import { ResourceModule } from '../resource/resource.module';
import { BackupModule } from '../backup/backup.module';
import { ConfigModule } from '../config/config.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Service.name,
        useFactory: () => {
          const schema = ServiceSchema;
          schema.plugin(uuidPlugin);
          schema.plugin(servicePlugin);
          return schema;
        },
      },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => BackupModule),
    HttpModule,
    ConfigModule,
    ResourceModule,
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
