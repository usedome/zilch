import { PickType } from '@nestjs/mapped-types';
import { Backup } from '../backup.schema';

export class CreateBackupDto extends PickType(Backup, ['url'] as const) {}
