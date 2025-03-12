import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { Client, ClientDocument } from '../schemas/client.schema';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, mot_de_passe, nom, prenom, telephone, adresse } =
      registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Créer un nouvel utilisateur
    const newUser = new this.userModel({
      email,
      mot_de_passe: hashedPassword,
      nom,
      prenom,
      role: 'client',
      statut: 'actif',
    });

    const savedUser = await newUser.save();

    // Créer un nouveau client associé à l'utilisateur
    const newClient = new this.clientModel({
      utilisateur_id: savedUser._id,
      telephone,
      adresse,
      date_inscription: new Date(),
    });

    await newClient.save();

    return { message: 'Utilisateur enregistré avec succès' };
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user: any }> {
    const { email, mot_de_passe } = loginDto;

    // Trouver l'utilisateur par email
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérifier si le mot de passe est correct
    const isPasswordValid = await bcrypt.compare(
      mot_de_passe,
      user.mot_de_passe,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Générer JWT
    const payload = { email: user.email, sub: user._id, role: user.role };
    const token = this.jwtService.sign(payload);

    // Retourner informations utilisateur sans le mot de passe
    const userResponse = {
      _id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      statut: user.statut,
    };

    return { token, user: userResponse };
  }
}
