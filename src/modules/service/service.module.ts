import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { servicePlugin, uuidPlugin } from 'src/utilities';
import { Service, ServiceSchema } from './service.schema';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';

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
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}
