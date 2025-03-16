export declare class CreateReservationDto {
    utilisateur_id?: string;
    voiture_id: string;
    date_debut: Date;
    date_fin: Date;
    offre_id?: string;
    statut?: string;
    prix_total?: number;
    options?: string[];
    code_promo?: string;
    etape_reservation?: number;
    acompte_paye?: boolean;
    montant_acompte?: number;
    commentaires?: string;
}
