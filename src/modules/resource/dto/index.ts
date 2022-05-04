import { PartialType, PickType } from '@nestjs/mapped-types';
import { Resource } from '../resource.schema';
import { HydratedDocument } from 'mongoose';
import { Service } from 'src/modules/service/service.schema';

export class CreateResourceDto extends PickType(Resource, [
  'name',
  'description',
  'is_active',
] as const) {}

export class UpdateResourceDto extends PartialType(CreateResourceDto) {}

export class EditResourcePipeDto {
  body: CreateResourceDto | UpdateResourceDto;

  service?: HydratedDocument<Service>;

  resource?: HydratedDocument<Resource>;
}
