export declare class UpdateReservationDto {
    voiture_id?: string;
    date_debut?: Date;
    date_fin?: Date;
    offre_id?: string;
    statut?: string;
    prix_total?: number;
    code_promo?: string;
    options?: string[];
    etape_reservation?: number;
    acompte_paye?: boolean;
    montant_acompte?: number;
    commentaires?: string;
}
