// src/offers/dto/filter-offers.dto.ts
import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export class FilterOffersDto {
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
  @IsDateString()
  date_debut_min?: Date;

  @IsOptional()
  @IsDateString()
  date_fin_max?: Date;
}
