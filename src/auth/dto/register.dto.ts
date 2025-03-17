import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: "'Nom de l'utilisateur'",
    example: 'Ngoor',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  nom: string;

  @ApiProperty({
    description: "'Prénom de l'utilisateur'",
    example: 'FAYE',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  prenom: string;

  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'FAYE.Ngoor@example.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "'Mot de passe de l'utilisateur (minimum 6 caractères)'",
    example: 'motdepasse123',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  mot_de_passe: string;

  @ApiProperty({
    description: "'Numéro de téléphone de l'utilisateur'",
    example: '01 23 45 67 89',
    required: false,
  })
  @IsString()
  telephone: string;

  @ApiProperty({
    description: "'Adresse postale de l'utilisateur'",
    example: '123 Avenue de la République, 75011 Paris',
    required: false,
  })
  @IsString()
  adresse: string;
}
