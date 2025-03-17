import { ApiProperty } from '@nestjs/swagger';

export class VoitureOccupationDto {
  @ApiProperty({
    example: '6072f329a01c7d001bcf7812',
    description: 'Identifiant du véhicule',
  })
  voitureId: string;

  @ApiProperty({ example: 'Toyota', description: 'Marque du véhicule' })
  marque: string;

  @ApiProperty({ example: 'Corolla', description: 'Modèle du véhicule' })
  modele: string;

  @ApiProperty({
    example: 78.5,
    description: "'Taux d'occupation en pourcentage'",
  })
  tauxOccupation: number; // Pourcentage d'occupation

  @ApiProperty({
    example: 45,
    description: 'Nombre total de jours en location',
  })
  jours: number; // Nombre total de jours en location
}

export class VoitureRevenuDto {
  @ApiProperty({
    example: '6072f329a01c7d001bcf7812',
    description: 'Identifiant du véhicule',
  })
  voitureId: string;

  @ApiProperty({ example: 'Toyota', description: 'Marque du véhicule' })
  marque: string;

  @ApiProperty({ example: 'Corolla', description: 'Modèle du véhicule' })
  modele: string;

  @ApiProperty({
    example: 350000,
    description: 'Revenus générés par le véhicule en FCFA',
  })
  revenus: number;
}

export class RevenuMensuelDto {
  @ApiProperty({ example: 'Janvier 2023', description: 'Mois et année' })
  mois: string;

  @ApiProperty({ example: 125000, description: 'Revenus pour le mois en FCFA' })
  revenus: number;
}

export class IndicateursPerformanceDto {
  @ApiProperty({
    type: [VoitureOccupationDto],
    description: "'Taux d'occupation par véhicule'",
  })
  tauxOccupationParVoiture: VoitureOccupationDto[];

  @ApiProperty({
    type: [VoitureRevenuDto],
    description: 'Revenus générés par véhicule',
  })
  revenusParVoiture: VoitureRevenuDto[];

  @ApiProperty({
    type: [RevenuMensuelDto],
    description: 'Revenus mensuels',
  })
  revenusParMois: RevenuMensuelDto[];
}
