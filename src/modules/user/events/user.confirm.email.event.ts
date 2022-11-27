import { HydratedDocument } from 'mongoose';
import { User } from '../user.schema';

export class UserConfirmEmailEvent {
  user: HydratedDocument<User>;

  constructor(user: HydratedDocument<User>) {
    this.user = user;
  }
}
