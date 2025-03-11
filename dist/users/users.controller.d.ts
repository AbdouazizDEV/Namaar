import { UsersService } from './users.service';
import { CreateUserDto } from '../users/dto/create-user.dto/create-user.dto';
import { User } from '../schemas/user.schema';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, updateUserDto: any): Promise<User>;
    remove(id: string): Promise<User>;
}
