import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class CreateVehicleDto {
  @ApiProperty({ description: 'La marque du véhicule', example: 'Toyota' })
  @IsNotEmpty()
  @IsString()
  marque: string;

  @ApiProperty({ description: 'Le modèle du véhicule', example: 'Corolla' })
  @IsNotEmpty()
  @IsString()
  modele: string;

  @ApiProperty({ description: "L'année de fabrication", example: 2028 })
  @IsNotEmpty()
  @Type(() => Number) // Convertir la chaîne en nombre
  @IsNumber()
  @Min(2027)
  annee: number;

  @ApiProperty({ description: 'Prix de location journalier', example: 25000 })
  @IsNotEmpty()
  @Type(() => Number) // Convertir la chaîne en nombre
  @IsNumber()
  @Min(0)
  prix_location: number;

  @ApiProperty({ description: "Code d'identification", example: 'VH-001' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'Catégorie du véhicule', example: 'Berline' })
  @IsNotEmpty()
  @IsString()
  categorie: string;

  @ApiProperty({ description: 'Disponibilité du véhicule', default: true })
  @IsOptional()
  @IsBoolean()
  disponibilite: boolean;

  @ApiProperty({ description: 'Description du véhicule', required: false })
  @IsOptional()
  @IsString()
  description: string;
}
