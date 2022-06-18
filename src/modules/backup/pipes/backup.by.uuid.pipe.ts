import { Injectable, PipeTransform, Inject, HttpStatus } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ResourceService } from 'src/modules/resource/resource.service';
import { throwException } from 'src/utilities';
import { BackupService } from '../backup.service';

@Injectable()
export class BackupByUuidPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private backupService: BackupService,
    private resourceService: ResourceService,
  ) {}

  async transform(backup_uuid: string) {
    const { params, user } = this.request;
    const resource = await this.resourceService.findOne({
      uuid: params.resource_uuid,
    });

    if (
      !resource ||
      resource.service.user._id.toString() !== user.id.toString()
    ) {
      throwException(
        HttpStatus.NOT_FOUND,
        'resource-001',
        'resource does not exist',
      );
    }

    const backup = await this.backupService.findOne({
      resource: String(resource._id),
      uuid: backup_uuid,
    });

    if (!backup) {
      throwException(
        HttpStatus.NOT_FOUND,
        'backup-001',
        'backup does not exist',
      );
    }

    return backup;
  }
}
