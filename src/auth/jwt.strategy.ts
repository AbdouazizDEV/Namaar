import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'votre_secret_jwt', // Utilisez la même clé secrète que dans le AuthModule
    });
  }

  async validate(payload: any) {
    const { sub } = payload;
    const user = await this.userModel.findById(sub).select('-mot_de_passe').exec();

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
