import { HydratedDocument } from 'mongoose';
import { User } from '../user.schema';

export class UserResetEmailVerifyEvent {
  user: HydratedDocument<User>;
  email: string;

  constructor(user: HydratedDocument<User>, email: string) {
    this.user = user;
    this.email = email;
  }
}
