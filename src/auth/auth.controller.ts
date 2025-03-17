import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { Public } from './public.decorator';
import {
  ApiTags,
  ApiProperty,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

// Créons d'abord les classes de réponse pour la documentation
class UserRegistrationResponse {
  @ApiProperty({ example: '6072f329a01c7d001bcf7812' })
  _id: string;

  @ApiProperty({ example: 'Ngoor' })
  nom: string;

  @ApiProperty({ example: 'FAYE' })
  prenom: string;

  @ApiProperty({ example: 'FAYE.Ngoor@example.com' })
  email: string;
}

class AuthTokenResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: '6072f329a01c7d001bcf7812' })
  userId: string;

  @ApiProperty({ example: 'FAYE' })
  prenom: string;

  @ApiProperty({ example: 'Ngoor' })
  nom: string;

  @ApiProperty({ example: 'client' })
  role: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: "'Inscription d'un nouvel utilisateur'" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: "'L'utilisateur a été créé avec succès.'",
    type: UserRegistrationResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou utilisateur déjà existant.',
  })
  register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: "'Connexion d'un utilisateur'" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie.',
    type: AuthTokenResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides.',
  })
  login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
