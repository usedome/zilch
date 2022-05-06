import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types, HydratedDocument } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private user: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    const _id = new Types.ObjectId();
    if (dto?.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
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

  async update(user: HydratedDocument<User>, dto: UpdateUserDto) {
    Object.entries(dto).forEach(([key, value]) => {
      user[key] = value;
    });
    await user.save();
    return user;
  }
}
