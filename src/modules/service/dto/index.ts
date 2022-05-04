import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsBoolean, IsDefined, IsString } from 'class-validator';
import { Service } from '../service.schema';

export class CreateServiceDto extends PickType(Service, [
  'name',
  'description',
] as const) {}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

export class CreateApiKeyDto {
  @IsDefined()
  @IsString()
  name: string;
}
