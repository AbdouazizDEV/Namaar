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
exports.AlertesDto = exports.AlerteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AlerteDto {
}
exports.AlerteDto = AlerteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '6072f329a01c7d001bcf7812',
        description: "'Identifiant unique de l'alerte'",
    }),
    __metadata("design:type", String)
], AlerteDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'retard',
        description: "'Type d'alerte'",
        enum: ['retard', 'maintenance', 'paiement', 'disponibilité'],
    }),
    __metadata("design:type", String)
], AlerteDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Retard de paiement pour la location #234',
        description: "'Message détaillant l'alerte'",
    }),
    __metadata("design:type", String)
], AlerteDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'haute',
        description: "'Niveau de priorité de l'alerte'",
        enum: ['haute', 'moyenne', 'basse'],
    }),
    __metadata("design:type", String)
], AlerteDto.prototype, "priorite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-05-12T14:30:00Z',
        description: "'Date de création de l'alerte'",
    }),
    __metadata("design:type", Date)
], AlerteDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '6072f329a01c7d001bcf7814',
        description: "'ID de l'entité concernée par l'alerte'",
        required: false,
    }),
    __metadata("design:type", String)
], AlerteDto.prototype, "entiteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'reservation',
        description: "'Type d'entité concernée'",
        required: false,
    }),
    __metadata("design:type", String)
], AlerteDto.prototype, "entiteType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Contacter le client',
        description: 'Action recommandée',
        required: false,
    }),
    __metadata("design:type", String)
], AlerteDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: "'Indique si l'alerte a été traitée'",
    }),
    __metadata("design:type", Boolean)
], AlerteDto.prototype, "traitee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-05-14T09:15:00Z',
        description: "'Date à laquelle l'alerte a été traitée'",
        required: false,
    }),
    __metadata("design:type", Date)
], AlerteDto.prototype, "dateTraitement", void 0);
class AlertesDto {
}
exports.AlertesDto = AlertesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AlerteDto], description: 'Liste des alertes' }),
    __metadata("design:type", Array)
], AlertesDto.prototype, "alertes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12, description: "'Nombre total d'alertes'" }),
    __metadata("design:type", Number)
], AlertesDto.prototype, "nombreTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 3,
        description: "'Nombre d'alertes de haute priorité'",
    }),
    __metadata("design:type", Number)
], AlertesDto.prototype, "nombreHautePriorite", void 0);
//# sourceMappingURL=alerte.dto.js.map