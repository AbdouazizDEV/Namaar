// src/reservations/dto/filter-reservations.dto.ts
import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';

export class FilterReservationsDto {
  @IsOptional()
  @IsString()
  utilisateur_id?: string;

  @IsOptional()
  @IsString()
  voiture_id?: string;

  @IsOptional()
  @IsDateString()
  date_debut_min?: Date;

  @IsOptional()
  @IsDateString()
  date_debut_max?: Date;

  @IsOptional()
  @IsDateString()
  date_fin_min?: Date;

  @IsOptional()
  @IsDateString()
  date_fin_max?: Date;

  @IsOptional()
  @IsEnum(['en_attente', 'confirmee', 'annulee', 'terminee'])
  statut?: string;

  @IsOptional()
  @IsDateString()
  date_reservation_min?: Date;

  @IsOptional()
  @IsDateString()
  date_reservation_max?: Date;
}
