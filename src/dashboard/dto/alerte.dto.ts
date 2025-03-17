import { ApiProperty } from '@nestjs/swagger';

export class AlerteDto {
  @ApiProperty({
    example: '6072f329a01c7d001bcf7812',
    description: "'Identifiant unique de l'alerte'",
  })
  id: string;
  @ApiProperty({
    example: 'retard',
    description: "'Type d'alerte'",
    enum: ['retard', 'maintenance', 'paiement', 'disponibilité'],
  })
  type: string; // 'retard', 'maintenance', 'paiement', 'disponibilité'

  @ApiProperty({
    example: 'Retard de paiement pour la location #234',
    description: "'Message détaillant l'alerte'",
  })
  message: string;

  @ApiProperty({
    example: 'haute',
    description: "'Niveau de priorité de l'alerte'",
    enum: ['haute', 'moyenne', 'basse'],
  })
  priorite: string; // 'haute', 'moyenne', 'basse'

  @ApiProperty({
    example: '2023-05-12T14:30:00Z',
    description: "'Date de création de l'alerte'",
  })
  date: Date;

  @ApiProperty({
    example: '6072f329a01c7d001bcf7814',
    description: "'ID de l'entité concernée par l'alerte'",
    required: false,
  })
  entiteId?: string; // ID de la réservation, location, voiture concernée

  @ApiProperty({
    example: 'reservation',
    description: "'Type d'entité concernée'",
    required: false,
  })
  entiteType?: string; // Type d'entité concernée

  @ApiProperty({
    example: 'Contacter le client',
    description: 'Action recommandée',
    required: false,
  })
  action?: string; // Action suggérée

  @ApiProperty({
    example: false,
    description: "'Indique si l'alerte a été traitée'",
  })
  traitee: boolean;

  @ApiProperty({
    example: '2023-05-14T09:15:00Z',
    description: "'Date à laquelle l'alerte a été traitée'",
    required: false,
  })
  dateTraitement?: Date;
}

export class AlertesDto {
  @ApiProperty({ type: [AlerteDto], description: 'Liste des alertes' })
  alertes: AlerteDto[];

  @ApiProperty({ example: 12, description: "'Nombre total d'alertes'" })
  nombreTotal: number;

  @ApiProperty({
    example: 3,
    description: "'Nombre d'alertes de haute priorité'",
  })
  nombreHautePriorite: number;
}
