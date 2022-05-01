import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { servicePlugin, uuidPlugin } from 'src/utilities';
import { Service, ServiceSchema } from './service.schema';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { UserModule } from '../user/user.module';

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
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
