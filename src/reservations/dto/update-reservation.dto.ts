// src/reservations/dto/update-reservation.dto.ts
import {
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReservationDto {
  @IsOptional()
  @IsString()
  voiture_id?: string;

  @IsOptional()
  @IsDateString()
  date_debut?: Date;

  @IsOptional()
  @IsDateString()
  date_fin?: Date;

  @IsOptional()
  @IsString()
  offre_id?: string;

  @IsOptional()
  @IsEnum(['en_attente', 'confirmee', 'annulee', 'terminee'])
  statut?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prix_total?: number;

  @IsOptional()
  @IsString()
  code_promo?: string;
}
