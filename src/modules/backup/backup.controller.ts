import {
  Controller,
  Query,
  Param,
  Get,
  Delete,
  Res,
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
    @Query('count', new DefaultValuePipe(12), ParseIntPipe) count: number,
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
    const hasMoreBackups =
      backups.length === 0
        ? false
        : Boolean(
            await this.backupService.count({
              ...filter,
              created_at: { $lt: backups[0].created_at },
            }),
          );
    return { backups, hasMoreBackups, message: 'backups fetched successfully' };
  }

  @Delete('/:backup_uuid')
  async deleteBackup(
    @Param('backup_uuid', BackupByUuidPipe) backup: HydratedDocument<Backup>,
    @Res({ passthrough: true }) res,
  ) {
    await backup.delete();
    res.status(204);
  }
}
