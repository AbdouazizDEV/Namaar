export class StatistiquesPeriodeDto {
  periode: string; // 'jour', 'semaine', 'mois', 'annee'
  labels: string[]; // Dates/périodes pour l'axe X
  reservations: number[]; // Nombre de réservations par période
  locations: number[]; // Nombre de locations par période
  revenus: number[]; // Revenus par période
}
