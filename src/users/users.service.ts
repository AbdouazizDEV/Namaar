import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto/create-user.dto';
import { UpdateQuery } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save() as Promise<User>;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec() as Promise<User[]>;
  }
  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec() as Promise<User>;
  }
  async update(
    id: string,
    updateUserDto: UpdateQuery<UserDocument>,
  ): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec() as Promise<User>;
  }
  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec() as Promise<User>;
  }
}
