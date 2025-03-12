// src/vehicles/dto/update-vehicle.dto.ts

import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  marque?: string;

  @IsOptional()
  @IsString()
  modele?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  annee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prix_location?: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsBoolean()
  disponibilite?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
