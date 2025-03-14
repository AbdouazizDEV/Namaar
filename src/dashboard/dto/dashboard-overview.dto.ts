export class ReservationRecenteDto {
  id: string;
  clientNom: string;
  clientPrenom: string;
  voitureMarque: string;
  voitureModele: string;
  dateDebut: Date;
  dateFin: Date;
  statut: string;
  montantTotal: number;
}

export class LocationRecenteDto {
  id: string;
  clientNom: string;
  clientPrenom: string;
  voitureMarque: string;
  voitureModele: string;
  dateDebut: Date;
  dateFin: Date;
  jours: number;
  kmDepart: number;
  montantTotal: number;
}

export class DashboardOverviewDto {
  // Statistiques générales
  totalReservations: number;
  totalLocations: number;
  totalVoitures: number;
  voituresDisponibles: number;
  clientsActifs: number;

  // Performance financière
  revenuTotal: number;
  revenuMensuel: number;
  revenuJournalier: number;
  montantEnAttente: number;

  // Taux d'occupation
  tauxOccupation: number; // Pourcentage des voitures actuellement louées
  dureeLocationMoyenne: number; // En jours

  // Activité récente
  reservationsRecentes: ReservationRecenteDto[];
  prochainsRetours: LocationRecenteDto[];
}
