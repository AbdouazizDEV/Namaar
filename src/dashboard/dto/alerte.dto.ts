export class AlerteDto {
  id: string;
  type: string; // 'retard', 'maintenance', 'paiement', 'disponibilité'
  message: string;
  priorite: string; // 'haute', 'moyenne', 'basse'
  date: Date;
  entiteId?: string; // ID de la réservation, location, voiture concernée
  entiteType?: string; // Type d'entité concernée
  action?: string; // Action suggérée
  traitee: boolean;
  dateTraitement?: Date;
}

export class AlertesDto {
  alertes: AlerteDto[];
  nombreTotal: number;
  nombreHautePriorite: number;
}
