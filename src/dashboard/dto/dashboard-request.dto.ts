import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum PeriodeType {
  JOUR = 'jour',
  SEMAINE = 'semaine',
  MOIS = 'mois',
  ANNEE = 'annee',
}

export class DashboardRequestDto {
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @IsOptional()
  @IsEnum(PeriodeType)
  periode?: PeriodeType;
}
