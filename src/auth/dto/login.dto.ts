import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: "'Adresse email de l'utilisateur'",
    example: 'utilisateur@example.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "'Mot de passe de l'utilisateur'",
    example: 'motdepasse123',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  mot_de_passe: string;
}
