import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Backup, BackupDocument } from './backup.schema';

@Injectable()
export class BackupService {
  constructor(
    @InjectModel(Backup.name) private backup: Model<BackupDocument>,
  ) {}

  async findOne(filter: { [key: string]: string }) {
    return await this.backup.findOne({ ...filter });
  }

  async get(filter: { [key: string]: any }, count: number) {
    return await this.backup
      .find({ ...filter })
      .sort({ created_at: 'desc' })
      .limit(count);
  }
}
