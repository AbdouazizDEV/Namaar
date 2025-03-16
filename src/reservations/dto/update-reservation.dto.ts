// src/reservations/dto/update-reservation.dto.ts
import {
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
  IsBoolean,
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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  etape_reservation?: number;

  @IsOptional()
  @IsBoolean()
  acompte_paye?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montant_acompte?: number;

  @IsOptional()
  @IsString()
  commentaires?: string;
}
