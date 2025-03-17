import { ApiProperty } from '@nestjs/swagger';

export class StatistiquesPeriodeDto {
  @ApiProperty({
    example: 'mois',
    description: "'Type de période utilisée pour l'analyse'",
    enum: ['jour', 'semaine', 'mois', 'annee'],
  })
  periode: string; // 'jour', 'semaine', 'mois', 'annee'

  @ApiProperty({
    example: ['Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023'],
    description: "'Labels pour l'axe X des graphiques'",
  })
  labels: string[]; // Dates/périodes pour l'axe X

  @ApiProperty({
    example: [12, 15, 10, 18],
    description: 'Nombre de réservations pour chaque période',
  })
  reservations: number[]; // Nombre de réservations par période

  @ApiProperty({
    example: [10, 12, 8, 15],
    description: 'Nombre de locations pour chaque période',
  })
  locations: number[]; // Nombre de locations par période

  @ApiProperty({
    example: [120000, 150000, 100000, 180000],
    description: 'Revenus en FCFA pour chaque période',
  })
  revenus: number[]; // Revenus par période
}
