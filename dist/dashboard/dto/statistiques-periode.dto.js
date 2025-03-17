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
exports.StatistiquesPeriodeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class StatistiquesPeriodeDto {
}
exports.StatistiquesPeriodeDto = StatistiquesPeriodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'mois',
        description: "'Type de période utilisée pour l'analyse'",
        enum: ['jour', 'semaine', 'mois', 'annee'],
    }),
    __metadata("design:type", String)
], StatistiquesPeriodeDto.prototype, "periode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023'],
        description: "'Labels pour l'axe X des graphiques'",
    }),
    __metadata("design:type", Array)
], StatistiquesPeriodeDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [12, 15, 10, 18],
        description: 'Nombre de réservations pour chaque période',
    }),
    __metadata("design:type", Array)
], StatistiquesPeriodeDto.prototype, "reservations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [10, 12, 8, 15],
        description: 'Nombre de locations pour chaque période',
    }),
    __metadata("design:type", Array)
], StatistiquesPeriodeDto.prototype, "locations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [120000, 150000, 100000, 180000],
        description: 'Revenus en FCFA pour chaque période',
    }),
    __metadata("design:type", Array)
], StatistiquesPeriodeDto.prototype, "revenus", void 0);
//# sourceMappingURL=statistiques-periode.dto.js.map