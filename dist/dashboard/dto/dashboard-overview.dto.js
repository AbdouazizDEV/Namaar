"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardOverviewDto = exports.LocationRecenteDto = exports.ReservationRecenteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ReservationRecenteDto {
}
exports.ReservationRecenteDto = ReservationRecenteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '6072f329a01c7d001bcf7812',
        description: 'Identifiant de la réservation',
    }),
    __metadata("design:type", String)
], ReservationRecenteDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dupont', description: 'Nom du client' }),
    __metadata("design:type", String)
], ReservationRecenteDto.prototype, "clientNom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jean', description: 'Prénom du client' }),
    __metadata("design:type", String)
], ReservationRecenteDto.prototype, "clientPrenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Toyota', description: 'Marque du véhicule' }),
    __metadata("design:type", String)
], ReservationRecenteDto.prototype, "voitureMarque", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Corolla', description: 'Modèle du véhicule' }),
    __metadata("design:type", String)
], ReservationRecenteDto.prototype, "voitureModele", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-05-12T14:30:00Z',
        description: 'Date de début de la réservation',
    }),
    __metadata("design:type", Date)
], ReservationRecenteDto.prototype, "dateDebut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-05-15T10:00:00Z',
        description: 'Date de fin de la réservation',
    }),
    __metadata("design:type", Date)
], ReservationRecenteDto.prototype, "dateFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'confirmee',
        description: 'Statut de la réservation',
    }),
    __metadata("design:type", String)
], ReservationRecenteDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 45000,
        description: 'Montant total de la réservation en FCFA',
    }),
    __metadata("design:type", Number)
], ReservationRecenteDto.prototype, "montantTotal", void 0);
class LocationRecenteDto {
}
exports.LocationRecenteDto = LocationRecenteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '6072f329a01c7d001bcf7813',
        description: 'Identifiant de la location',
    }),
    __metadata("design:type", String)
], LocationRecenteDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dupont', description: 'Nom du client' }),
    __metadata("design:type", String)
], LocationRecenteDto.prototype, "clientNom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jean', description: 'Prénom du client' }),
    __metadata("design:type", String)
], LocationRecenteDto.prototype, "clientPrenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Toyota', description: 'Marque du véhicule' }),
    __metadata("design:type", String)
], LocationRecenteDto.prototype, "voitureMarque", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Corolla', description: 'Modèle du véhicule' }),
    __metadata("design:type", String)
], LocationRecenteDto.prototype, "voitureModele", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-05-12T14:30:00Z',
        description: 'Date de début de la location',
    }),
    __metadata("design:type", Date)
], LocationRecenteDto.prototype, "dateDebut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-05-15T10:00:00Z',
        description: 'Date de fin de la location',
    }),
    __metadata("design:type", Date)
], LocationRecenteDto.prototype, "dateFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, description: 'Durée de la location en jours' }),
    __metadata("design:type", Number)
], LocationRecenteDto.prototype, "jours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12500, description: 'Kilométrage au départ' }),
    __metadata("design:type", Number)
], LocationRecenteDto.prototype, "kmDepart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 45000,
        description: 'Montant total de la location en FCFA',
    }),
    __metadata("design:type", Number)
], LocationRecenteDto.prototype, "montantTotal", void 0);
class DashboardOverviewDto {
}
exports.DashboardOverviewDto = DashboardOverviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120, description: 'Nombre total de réservations' }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "totalReservations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 85, description: 'Nombre total de locations' }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "totalLocations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 35, description: 'Nombre total de véhicules' }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "totalVoitures", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 20,
        description: 'Nombre de véhicules actuellement disponibles',
    }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "voituresDisponibles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150, description: 'Nombre de clients actifs' }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "clientsActifs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1250000, description: 'Revenu total en FCFA' }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "revenuTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 350000, description: 'Revenu mensuel en FCFA' }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "revenuMensuel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12000,
        description: 'Revenu journalier moyen en FCFA',
    }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "revenuJournalier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 75000,
        description: 'Montant des paiements en attente en FCFA',
    }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "montantEnAttente", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 65.3,
        description: "'Taux d'occupation des véhicules en pourcentage'",
    }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "tauxOccupation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 4.2,
        description: 'Durée moyenne des locations en jours',
    }),
    __metadata("design:type", Number)
], DashboardOverviewDto.prototype, "dureeLocationMoyenne", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ReservationRecenteDto],
        description: 'Liste des réservations récentes',
    }),
    __metadata("design:type", Array)
], DashboardOverviewDto.prototype, "reservationsRecentes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [LocationRecenteDto],
        description: 'Liste des véhicules devant être retournés prochainement',
    }),
    __metadata("design:type", Array)
], DashboardOverviewDto.prototype, "prochainsRetours", void 0);
//# sourceMappingURL=dashboard-overview.dto.js.map