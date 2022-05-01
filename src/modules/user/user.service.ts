import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private user: Model<UserDocument>) {}

  async create(dto: Pick<User, 'name' | 'email' | 'avatar'>) {
    const _id = new Types.ObjectId();
    return await this.user.create({ _id, ...dto });
  }

  async findOne(filter: { [key: string]: string }) {
    return await this.user.findOne({ ...filter });
  }

  async firstOrCreate(email: string, dto: Pick<User, 'name' | 'avatar'>) {
    const user = await this.findOne({ email });
    if (user) return user;
    return await this.create({ email, ...dto });
  }
}
