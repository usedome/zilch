import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from 'eventemitter2';
import { Model, Types, HydratedDocument } from 'mongoose';
import { generateRandomToken } from 'src/utilities';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserRegisteredGoogleEvent } from './events';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private user: Model<UserDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateUserDto) {
    const _id = new Types.ObjectId();
    if (dto?.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    return await this.user.create({
      _id,
      ...dto,
      email_verification_token:
        dto.auth_type === 'GOOGLE' ? undefined : generateRandomToken(60),
    });
  }

  async findOne(filter: { [key: string]: string }) {
    return await this.user.findOne({ ...filter });
  }

  async firstOrCreate(
    email: string,
    dto: Pick<User, 'first_name' | 'last_name' | 'avatar' | 'auth_type'>,
  ) {
    let user = await this.findOne({ email });
    if (user) return user;
    user = await this.create({
      email,
      ...dto,
      password: generateRandomToken(12),
    });
    if (user.auth_type === 'GOOGLE')
      this.eventEmitter.emit(
        'user.registered.google',
        new UserRegisteredGoogleEvent(user),
      );
    return user;
  }

  async update(user: HydratedDocument<User>, dto: UpdateUserDto) {
    Object.entries(dto).forEach(([key, value]) => {
      user[key] = value;
    });
    await user.save();
    return user;
  }
}
