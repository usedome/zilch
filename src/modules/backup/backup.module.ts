import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { backupPlugin, uuidPlugin } from 'src/utilities';
import { Backup, BackupSchema } from './backup.schema';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { ResourceModule } from '../resource/resource.module';
import { ServiceModule } from '../service/service.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    forwardRef(() => ServiceModule),
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
    forwardRef(() => ResourceModule),
  ],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}
