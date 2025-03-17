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
exports.IndicateursPerformanceDto = exports.RevenuMensuelDto = exports.VoitureRevenuDto = exports.VoitureOccupationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class VoitureOccupationDto {
}
exports.VoitureOccupationDto = VoitureOccupationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '6072f329a01c7d001bcf7812',
        description: 'Identifiant du véhicule',
    }),
    __metadata("design:type", String)
], VoitureOccupationDto.prototype, "voitureId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Toyota', description: 'Marque du véhicule' }),
    __metadata("design:type", String)
], VoitureOccupationDto.prototype, "marque", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Corolla', description: 'Modèle du véhicule' }),
    __metadata("design:type", String)
], VoitureOccupationDto.prototype, "modele", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 78.5,
        description: "'Taux d'occupation en pourcentage'",
    }),
    __metadata("design:type", Number)
], VoitureOccupationDto.prototype, "tauxOccupation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 45,
        description: 'Nombre total de jours en location',
    }),
    __metadata("design:type", Number)
], VoitureOccupationDto.prototype, "jours", void 0);
class VoitureRevenuDto {
}
exports.VoitureRevenuDto = VoitureRevenuDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '6072f329a01c7d001bcf7812',
        description: 'Identifiant du véhicule',
    }),
    __metadata("design:type", String)
], VoitureRevenuDto.prototype, "voitureId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Toyota', description: 'Marque du véhicule' }),
    __metadata("design:type", String)
], VoitureRevenuDto.prototype, "marque", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Corolla', description: 'Modèle du véhicule' }),
    __metadata("design:type", String)
], VoitureRevenuDto.prototype, "modele", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 350000,
        description: 'Revenus générés par le véhicule en FCFA',
    }),
    __metadata("design:type", Number)
], VoitureRevenuDto.prototype, "revenus", void 0);
class RevenuMensuelDto {
}
exports.RevenuMensuelDto = RevenuMensuelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Janvier 2023', description: 'Mois et année' }),
    __metadata("design:type", String)
], RevenuMensuelDto.prototype, "mois", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 125000, description: 'Revenus pour le mois en FCFA' }),
    __metadata("design:type", Number)
], RevenuMensuelDto.prototype, "revenus", void 0);
class IndicateursPerformanceDto {
}
exports.IndicateursPerformanceDto = IndicateursPerformanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [VoitureOccupationDto],
        description: "'Taux d'occupation par véhicule'",
    }),
    __metadata("design:type", Array)
], IndicateursPerformanceDto.prototype, "tauxOccupationParVoiture", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [VoitureRevenuDto],
        description: 'Revenus générés par véhicule',
    }),
    __metadata("design:type", Array)
], IndicateursPerformanceDto.prototype, "revenusParVoiture", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [RevenuMensuelDto],
        description: 'Revenus mensuels',
    }),
    __metadata("design:type", Array)
], IndicateursPerformanceDto.prototype, "revenusParMois", void 0);
//# sourceMappingURL=indicateurs-performance.dto.js.map