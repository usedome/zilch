import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsBoolean, IsDefined, IsIP, IsString } from 'class-validator';
import { Service } from '../service.schema';

export class CreateServiceDto extends PickType(Service, [
  'name',
  'description',
  'backup_duration',
] as const) {}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

export class CreateApiKeyDto {
  @IsDefined()
  @IsString()
  name: string;
}

export class CreateIpAddressDto {
  @IsDefined()
  @IsIP()
  value: string;
}

export class UpdateNotificationDto {
  @IsDefined()
  @IsString()
  key: string;

  @IsDefined()
  @IsBoolean()
  value: boolean;
}
