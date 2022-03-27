import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { resourcePlugin, uuidPlugin } from 'src/utilities';
import { Resource, ResourceSchema } from './resource.schema';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    ServiceModule,
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
  ],
  providers: [ResourceService],
  controllers: [ResourceController],
  exports: [ResourceService],
})
export class ResourceModule {}
