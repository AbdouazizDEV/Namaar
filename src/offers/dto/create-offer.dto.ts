// src/offers/dto/create-offer.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  reduction: number; // pourcentage de réduction

  @IsNotEmpty()
  @IsDateString()
  date_debut: Date;

  @IsNotEmpty()
  @IsDateString()
  date_fin: Date;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  statut: string;

  @IsOptional()
  @IsString()
  code_promo: string;

  @IsOptional()
  @IsArray()
  voitures: string[]; // IDs des voitures concernées par l'offre
}
