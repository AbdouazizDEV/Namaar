export declare class VoitureOccupationDto {
    voitureId: string;
    marque: string;
    modele: string;
    tauxOccupation: number;
    jours: number;
}
export declare class VoitureRevenuDto {
    voitureId: string;
    marque: string;
    modele: string;
    revenus: number;
}
export declare class RevenuMensuelDto {
    mois: string;
    revenus: number;
}
export declare class IndicateursPerformanceDto {
    tauxOccupationParVoiture: VoitureOccupationDto[];
    revenusParVoiture: VoitureRevenuDto[];
    revenusParMois: RevenuMensuelDto[];
}
