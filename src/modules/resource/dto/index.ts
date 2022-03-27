import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsDefined, IsString } from 'class-validator';
import { Resource } from '../resource.schema';

export class CreateResourceDto extends PickType(Resource, [
  'name',
  'description',
] as const) {}

export class UpdateResourceDto extends PartialType(CreateResourceDto) {}
