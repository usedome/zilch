import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/modules/user/user.schema';

export class CreateTokenDto extends PickType(User, [
  'email',
  'password',
] as const) {}
