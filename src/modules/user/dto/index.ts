import { PartialType, PickType } from '@nestjs/mapped-types';
import { User } from '../user.schema';
import { IsDefined, IsString, MinLength } from 'class-validator';
import { HasMimeType, IsFile, FileSystemStoredFile } from 'nestjs-form-data';
export class CreateUserDto extends PickType(User, [
  'first_name',
  'last_name',
  'email',
] as const) {
  @IsDefined()
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  avatar?: string;
}

export class UpdateUserDto extends PartialType(
  PickType(User, ['first_name', 'last_name', 'default_service'] as const),
) {
  avatar?: File;
}

export class ResetPasswordDto extends PickType(User, ['email'] as const) {}

export class ChangePasswordDto extends PickType(User, ['password'] as const) {}

export class ResetEmailDto extends PickType(User, ['password'] as const) {}

export class ChangeEmailDto extends PickType(User, ['email'] as const) {}
