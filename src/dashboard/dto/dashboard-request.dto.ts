import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum PeriodeType {
  JOUR = 'jour',
  SEMAINE = 'semaine',
  MOIS = 'mois',
  ANNEE = 'annee',
}

export class DashboardRequestDto {
  @ApiProperty({
    example: '2023-01-01',
    description: "'Date de début de la période d'analyse'",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiProperty({
    example: '2023-12-31',
    description: "'Date de fin de la période d'analyse'",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiProperty({
    enum: PeriodeType,
    example: 'mois',
    description: "'Type de période pour l'agrégation des données'",
    required: false,
  })
  @IsOptional()
  @IsEnum(PeriodeType)
  periode?: PeriodeType;
}
