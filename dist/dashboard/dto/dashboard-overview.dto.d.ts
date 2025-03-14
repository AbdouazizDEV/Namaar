export declare class ReservationRecenteDto {
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
export declare class LocationRecenteDto {
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
export declare class DashboardOverviewDto {
    totalReservations: number;
    totalLocations: number;
    totalVoitures: number;
    voituresDisponibles: number;
    clientsActifs: number;
    revenuTotal: number;
    revenuMensuel: number;
    revenuJournalier: number;
    montantEnAttente: number;
    tauxOccupation: number;
    dureeLocationMoyenne: number;
    reservationsRecentes: ReservationRecenteDto[];
    prochainsRetours: LocationRecenteDto[];
}
