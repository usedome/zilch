import { PartialType, PickType } from '@nestjs/mapped-types';
import { User } from '../user.schema';
import { IsDefined, IsString, MinLength } from 'class-validator';

export class CreateUserDto extends PickType(User, ['name', 'email'] as const) {
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  avatar?: string;
}

export class UpdateUserDto extends PartialType(
  PickType(User, ['name', 'email', 'password', 'default_service'] as const),
) {
  avatar?: File | string;
}

export class ResetPasswordDto extends PickType(User, ['email'] as const) {}

export class ChangePasswordDto extends PickType(User, ['password'] as const) {}
