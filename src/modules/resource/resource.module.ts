import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { resourcePlugin, uuidPlugin } from 'src/utilities';
import { Resource, ResourceSchema } from './resource.schema';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { ServiceModule } from '../service/service.module';
import { BackupModule } from '../backup/backup.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Resource.name,
        useFactory: () => {
          const schema = ResourceSchema;
          schema.plugin(uuidPlugin);
          schema.plugin(resourcePlugin);
          return schema;
        },
      },
    ]),
    ConfigModule,
    HttpModule,
    forwardRef(() => ServiceModule),
    forwardRef(() => BackupModule),
  ],
  providers: [ResourceService],
  controllers: [ResourceController],
  exports: [ResourceService],
})
export class ResourceModule {}
