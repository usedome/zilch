import { NestFactory } from '@nestjs/core';
import { Schema } from 'mongoose';
import { AppModule } from 'src/app.module';
import { BackupService } from 'src/modules/backup/backup.service';

export const resourcePlugin = (schema: Schema) => {
  schema.pre(['findOne'], async function () {
    this.populate('service');
  });

  schema.post('save', async function () {
    this.populate('service');
  });

  // schema.post('remove', async function () {
  //   const app = await NestFactory.createApplicationContext(AppModule);
  //   const backupService = app.get(BackupService);
  //   await backupService.deleteBackups({ resource: this._id });
  // });
};
