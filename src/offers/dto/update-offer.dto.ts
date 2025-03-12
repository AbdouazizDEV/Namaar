// src/offers/dto/update-offer.dto.ts
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  reduction?: number;

  @IsOptional()
  @IsDateString()
  date_debut?: Date;

  @IsOptional()
  @IsDateString()
  date_fin?: Date;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  statut?: string;

  @IsOptional()
  @IsString()
  code_promo?: string;

  @IsOptional()
  @IsArray()
  voitures?: string[];
}
