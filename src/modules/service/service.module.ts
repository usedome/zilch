import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './service.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Service.name,
        useFactory: () => {
          const schema = ServiceSchema;
          return schema;
        },
      },
    ]),
  ],
})
export class ServiceModule {}
