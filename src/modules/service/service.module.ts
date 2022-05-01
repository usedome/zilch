import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { servicePlugin, uuidPlugin } from 'src/utilities';
import { Service, ServiceSchema } from './service.schema';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { ResourceModule } from '../resource/resource.module';
import { ResourceService } from '../resource/resource.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Service.name,
        useFactory: (resourceService: ResourceService) => {
          const schema = ServiceSchema;
          schema.plugin(uuidPlugin);
          schema.plugin(servicePlugin);
          schema.virtual('resources', {
            ref: 'Resource',
            localField: '_id',
            foreignField: 'service',
          });
          return schema;
        },
        inject: [ResourceService],
        imports: [ResourceModule],
      },
    ]),
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
