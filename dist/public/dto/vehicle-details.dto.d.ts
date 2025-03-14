export declare class VehicleDetailsDto {
    id: string;
    marque: string;
    modele: string;
    annee: number;
    prix_location: number;
    categorie: string;
    disponibilite: boolean;
    description?: string;
    images: string[];
    disponibiliteDates?: {
        debut: Date;
        fin: Date;
    }[];
}
