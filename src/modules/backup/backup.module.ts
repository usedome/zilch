import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { backupPlugin, uuidPlugin } from 'src/utilities';
import { Backup, BackupSchema } from './backup.schema';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { ResourceModule } from '../resource/resource.module';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    ResourceModule,
    ServiceModule,
    MongooseModule.forFeatureAsync([
      {
        name: Backup.name,
        useFactory: () => {
          const schema = BackupSchema;
          schema.plugin(uuidPlugin);
          schema.plugin(backupPlugin);
          return schema;
        },
      },
    ]),
  ],
  controllers: [BackupController],
  providers: [BackupService],
})
export class BackupModule {}
