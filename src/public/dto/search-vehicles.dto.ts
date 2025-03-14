// src/public/dto/search-vehicles.dto.ts
import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum VehicleType {
  BERLINE = 'berline',
  SUV = 'suv',
  CITADINE = 'citadine',
  UTILITAIRE = 'utilitaire',
  LUXURY = 'luxe',
}

export class SearchVehiclesDto {
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @IsOptional()
  @IsEnum(VehicleType)
  categorie?: VehicleType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prixMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prixMax?: number;

  @IsOptional()
  @IsString()
  marque?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  anneeMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  anneeMax?: number;
}
