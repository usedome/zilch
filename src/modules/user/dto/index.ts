import { PartialType, PickType } from '@nestjs/mapped-types';
import { User } from '../user.schema';

export class UpdateUserDto extends PartialType(
  PickType(User, ['name', 'email', 'avatar', 'active_service'] as const),
) {}
