import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { uuidPlugin } from 'src/utilities';
import { Backup, BackupSchema } from './backup.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Backup.name,
        useFactory: () => {
          const schema = BackupSchema;
          schema.plugin(uuidPlugin);
          return schema;
        },
      },
    ]),
  ],
})
export class BackupModule {}
