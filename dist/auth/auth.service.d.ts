import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../schemas/user.schema';
import { ClientDocument } from '../schemas/client.schema';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
export declare class AuthService {
    private userModel;
    private clientModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, clientModel: Model<ClientDocument>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: any;
    }>;
}
