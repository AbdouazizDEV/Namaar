export declare enum PeriodeType {
    JOUR = "jour",
    SEMAINE = "semaine",
    MOIS = "mois",
    ANNEE = "annee"
}
export declare class DashboardRequestDto {
    dateDebut?: string;
    dateFin?: string;
    periode?: PeriodeType;
}
