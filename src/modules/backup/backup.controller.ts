import {
  Controller,
  Param,
  Post,
  Res,
  Body,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { HydratedDocument } from 'mongoose';
import { Resource } from '../resource/resource.schema';
import { CreateBackupDto } from './dto';
import { ResourceByUuidPipe } from '../resource/pipes/resource.by.uuid.pipe';
import { BackupByUuidPipe } from './pipes';
import { Backup } from './backup.schema';

@Controller('/resources/:resource_uuid/backups')
export class BackupController {
  constructor(private backupService: BackupService) {}

  @Post()
  async create(
    @Param('resource_uuid', ResourceByUuidPipe)
    resource: HydratedDocument<Resource>,
    @Res({ passthrough: true }) res,
    @Body() body: CreateBackupDto,
  ) {
    const backup = await this.backupService.create(
      { ...body },
      String(resource._id),
    );
    res.status(201).json({ backup, message: 'backup created successfully' });
  }

  @Get()
  async get(
    @Param('resource_uuid', ResourceByUuidPipe)
    resource: HydratedDocument<Resource>,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('count', new DefaultValuePipe(8), ParseIntPipe) count: number,
  ) {
    const { backups, pagination } = await this.backupService.get(
      { resource: String(resource._id) },
      page,
      count,
    );

    return { backups, pagination, message: 'backups fetched successfully' };
  }

  @Get('/:backup_uuid')
  async getOne(
    @Param('backup_uuid', BackupByUuidPipe) backup: HydratedDocument<Backup>,
  ) {
    return { backup, message: 'backup fetched successfully' };
  }
}
