export declare enum VehicleType {
    BERLINE = "berline",
    SUV = "suv",
    CITADINE = "citadine",
    UTILITAIRE = "utilitaire",
    LUXURY = "luxe"
}
export declare class SearchVehiclesDto {
    dateDebut?: string;
    dateFin?: string;
    categorie?: VehicleType;
    prixMin?: number;
    prixMax?: number;
    marque?: string;
    anneeMin?: number;
    anneeMax?: number;
}
