import {
  Controller,
  Query,
  Param,
  Get,
  Delete,
  Req,
  Res,
  ParseIntPipe,
  HttpStatus,
  DefaultValuePipe,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { HydratedDocument } from 'mongoose';
import { BackupByUuidPipe } from './pipes';
import { Backup } from './backup.schema';
import { ResourceService } from '../resource/resource.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { throwException } from '../../utilities';
import { Request } from 'express';

@Controller('/resources/:resource_uuid/backups')
export class BackupController {
  constructor(
    private backupService: BackupService,
    private resourceService: ResourceService,
    private httpService: HttpService,
    private configService: ConfigService,
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
    @Req() req: Request,
    @Res({ passthrough: true }) res,
  ) {
    const { headers } = req;
    const url =
      this.configService.get('DURAN_API_URL') + `/backups/${backup.uuid}`;

    try {
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { authorization: headers?.authorization ?? '' },
        }),
      );
      await backup.delete();
      res.status(204);
    } catch (error) {
      return throwException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'backup-002',
        `there was a problem deleting backup with uuid ${backup.uuid}`,
      );
    }
  }
}
