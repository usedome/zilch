import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { userPlugin, uuidPlugin } from 'src/utilities';
import { UserController } from './user.controller';
import { ServiceModule } from '../service/service.module';
import { MailModule } from '../mail/mail.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import {
  UserEmailVerifiedListener,
  UserRegisteredGoogleListener,
  UserRegisteredListener,
  UserResetPasswordListener,
} from './listeners';
import { TokenModule } from '../token/token.module';
import { UserConfirmEmailListener } from './listeners/user.confirm.email.listener';

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
    NestjsFormDataModule,
    forwardRef(() => ServiceModule),
    forwardRef(() => TokenModule),
    MailModule,
  ],
  providers: [
    UserService,
    UserConfirmEmailListener,
    UserEmailVerifiedListener,
    UserRegisteredListener,
    UserRegisteredGoogleListener,
    UserResetPasswordListener,
  ],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
