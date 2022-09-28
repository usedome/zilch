import { HydratedDocument } from 'mongoose';
import { User } from '../user.schema';

export class UserEmailVerifiedEvent {
  user: HydratedDocument<User>;

  constructor(user: HydratedDocument<User>) {
    this.user = user;
  }
}
