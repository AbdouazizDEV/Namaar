export class VoitureOccupationDto {
  voitureId: string;
  marque: string;
  modele: string;
  tauxOccupation: number; // Pourcentage d'occupation
  jours: number; // Nombre total de jours en location
}

export class VoitureRevenuDto {
  voitureId: string;
  marque: string;
  modele: string;
  revenus: number;
}

export class RevenuMensuelDto {
  mois: string;
  revenus: number;
}

export class IndicateursPerformanceDto {
  tauxOccupationParVoiture: VoitureOccupationDto[];
  revenusParVoiture: VoitureRevenuDto[];
  revenusParMois: RevenuMensuelDto[];
}
