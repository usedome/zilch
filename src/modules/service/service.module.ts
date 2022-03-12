import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { uuidPlugin } from 'src/utilities';
import { Service, ServiceSchema } from './service.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Service.name,
        useFactory: () => {
          const schema = ServiceSchema;
          schema.plugin(uuidPlugin);
          return schema;
        },
      },
    ]),
  ],
})
export class ServiceModule {}
