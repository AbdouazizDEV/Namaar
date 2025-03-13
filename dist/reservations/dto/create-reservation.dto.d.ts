export declare class CreateReservationDto {
    utilisateur_id?: string;
    voiture_id: string;
    date_debut: Date;
    date_fin: Date;
    offre_id?: string;
    statut?: string;
    prix_total?: number;
}
