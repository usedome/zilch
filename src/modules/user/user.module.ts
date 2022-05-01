import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { userPlugin, uuidPlugin } from 'src/utilities';
import { UserController } from './user.controller';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.plugin(uuidPlugin);
          schema.plugin(userPlugin);
          schema.virtual('services', {
            ref: 'Service',
            localField: '_id',
            foreignField: 'user',
          });
          return schema;
        },
      },
    ]),
    forwardRef(() => ServiceModule),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
