export declare class OfferDetailsDto {
    id: string;
    titre: string;
    description: string;
    prix_special: number;
    reduction_pourcentage: number;
    date_debut: Date;
    date_fin: Date;
    active: boolean;
    voiture: {
        id: string;
        marque: string;
        modele: string;
        annee: number;
        categorie: string;
        images: string[];
    };
}
