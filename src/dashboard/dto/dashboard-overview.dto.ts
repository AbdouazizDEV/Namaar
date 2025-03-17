import { ApiProperty } from '@nestjs/swagger';

export class ReservationRecenteDto {
  @ApiProperty({
    example: '6072f329a01c7d001bcf7812',
    description: 'Identifiant de la réservation',
  })
  id: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom du client' })
  clientNom: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom du client' })
  clientPrenom: string;

  @ApiProperty({ example: 'Toyota', description: 'Marque du véhicule' })
  voitureMarque: string;

  @ApiProperty({ example: 'Corolla', description: 'Modèle du véhicule' })
  voitureModele: string;

  @ApiProperty({
    example: '2023-05-12T14:30:00Z',
    description: 'Date de début de la réservation',
  })
  dateDebut: Date;

  @ApiProperty({
    example: '2023-05-15T10:00:00Z',
    description: 'Date de fin de la réservation',
  })
  dateFin: Date;

  @ApiProperty({
    example: 'confirmee',
    description: 'Statut de la réservation',
  })
  statut: string;

  @ApiProperty({
    example: 45000,
    description: 'Montant total de la réservation en FCFA',
  })
  montantTotal: number;
}

export class LocationRecenteDto {
  @ApiProperty({
    example: '6072f329a01c7d001bcf7813',
    description: 'Identifiant de la location',
  })
  id: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom du client' })
  clientNom: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom du client' })
  clientPrenom: string;

  @ApiProperty({ example: 'Toyota', description: 'Marque du véhicule' })
  voitureMarque: string;

  @ApiProperty({ example: 'Corolla', description: 'Modèle du véhicule' })
  voitureModele: string;

  @ApiProperty({
    example: '2023-05-12T14:30:00Z',
    description: 'Date de début de la location',
  })
  dateDebut: Date;

  @ApiProperty({
    example: '2023-05-15T10:00:00Z',
    description: 'Date de fin de la location',
  })
  dateFin: Date;

  @ApiProperty({ example: 3, description: 'Durée de la location en jours' })
  jours: number;

  @ApiProperty({ example: 12500, description: 'Kilométrage au départ' })
  kmDepart: number;

  @ApiProperty({
    example: 45000,
    description: 'Montant total de la location en FCFA',
  })
  montantTotal: number;
}

export class DashboardOverviewDto {
  // Statistiques générales
  @ApiProperty({ example: 120, description: 'Nombre total de réservations' })
  totalReservations: number;

  @ApiProperty({ example: 85, description: 'Nombre total de locations' })
  totalLocations: number;

  @ApiProperty({ example: 35, description: 'Nombre total de véhicules' })
  totalVoitures: number;

  @ApiProperty({
    example: 20,
    description: 'Nombre de véhicules actuellement disponibles',
  })
  voituresDisponibles: number;

  @ApiProperty({ example: 150, description: 'Nombre de clients actifs' })
  clientsActifs: number;

  // Performance financière
  @ApiProperty({ example: 1250000, description: 'Revenu total en FCFA' })
  revenuTotal: number;

  @ApiProperty({ example: 350000, description: 'Revenu mensuel en FCFA' })
  revenuMensuel: number;

  @ApiProperty({
    example: 12000,
    description: 'Revenu journalier moyen en FCFA',
  })
  revenuJournalier: number;

  @ApiProperty({
    example: 75000,
    description: 'Montant des paiements en attente en FCFA',
  })
  montantEnAttente: number;

  // Taux d'occupation
  @ApiProperty({
    example: 65.3,
    description: "'Taux d'occupation des véhicules en pourcentage'",
  })
  tauxOccupation: number; // Pourcentage des voitures actuellement louées

  @ApiProperty({
    example: 4.2,
    description: 'Durée moyenne des locations en jours',
  })
  dureeLocationMoyenne: number; // En jours

  // Activité récente
  @ApiProperty({
    type: [ReservationRecenteDto],
    description: 'Liste des réservations récentes',
  })
  reservationsRecentes: ReservationRecenteDto[];

  @ApiProperty({
    type: [LocationRecenteDto],
    description: 'Liste des véhicules devant être retournés prochainement',
  })
  prochainsRetours: LocationRecenteDto[];
}
