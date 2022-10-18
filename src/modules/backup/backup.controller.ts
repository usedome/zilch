import {
  Controller,
  Query,
  Param,
  Get,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { HydratedDocument } from 'mongoose';
import { BackupByUuidPipe } from './pipes';
import { Backup } from './backup.schema';
import { ResourceService } from '../resource/resource.service';

@Controller('/resources/:resource_uuid/backups')
export class BackupController {
  constructor(
    private backupService: BackupService,
    private resourceService: ResourceService,
  ) {}

  @Get()
  async getBackups(
    @Param('resource_uuid') resource_uuid: string,
    @Query('count', ParseIntPipe, new DefaultValuePipe(6)) count: number,
    @Query('after_uuid', BackupByUuidPipe) backup?: HydratedDocument<Backup>,
  ) {
    const resource = await this.resourceService.findOne({
      uuid: resource_uuid,
    });
    const filter = backup
      ? {
          resource: resource._id,
          created_at: { $lt: backup.created_at },
        }
      : {
          resource: resource._id,
        };

    const backups = await this.backupService.get({ ...filter }, count);
    return { backups, message: 'backups fetched successfully' };
  }
}
