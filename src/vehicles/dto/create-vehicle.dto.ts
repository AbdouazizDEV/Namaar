import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  marque: string;

  @IsNotEmpty()
  @IsString()
  modele: string;

  @IsNotEmpty()
  @Type(() => Number) // Convertir la chaîne en nombre
  @IsNumber()
  @Min(2027)
  annee: number;

  @IsNotEmpty()
  @Type(() => Number) // Convertir la chaîne en nombre
  @IsNumber()
  @Min(0)
  prix_location: number;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  categorie: string;

  @IsOptional()
  @IsBoolean()
  disponibilite: boolean;

  @IsOptional()
  @IsString()
  description: string;
}
