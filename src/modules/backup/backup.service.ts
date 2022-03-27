import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Backup, BackupDocument } from './backup.schema';
import { CreateBackupDto } from './dto';

@Injectable()
export class BackupService {
  constructor(
    @InjectModel(Backup.name) private backup: Model<BackupDocument>,
  ) {}

  async create(dto: CreateBackupDto, resource: string) {
    return await this.backup.create({ ...dto, resource });
  }

  async findOne(filter: { [key: string]: string }) {
    return await this.backup.findOne({ ...filter });
  }

  async get(filter: { [key: string]: string }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const backups = await this.backup
      .find({ ...filter })
      .sort({ created_at: 'desc' })
      .skip(skip)
      .limit(limit);
    const pagination = await this.getPagination(filter, page, limit);
    return { backups, pagination };
  }

  async getPagination(
    filter: { [key: string]: string },
    page: number,
    limit: number,
  ) {
    const total = await this.backup.countDocuments(filter);
    const maxPages = Math.ceil(total / limit);
    return { currentPage: page, maxPages };
  }
}
