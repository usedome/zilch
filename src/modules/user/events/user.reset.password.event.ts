import { HydratedDocument } from 'mongoose';
import { User } from '../user.schema';

export class UserResetPasswordEvent {
  user: HydratedDocument<User>;

  constructor(user: HydratedDocument<User>) {
    this.user = user;
  }
}
