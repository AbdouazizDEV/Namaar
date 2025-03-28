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
exports.DashboardRequestDto = exports.PeriodeType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var PeriodeType;
(function (PeriodeType) {
    PeriodeType["JOUR"] = "jour";
    PeriodeType["SEMAINE"] = "semaine";
    PeriodeType["MOIS"] = "mois";
    PeriodeType["ANNEE"] = "annee";
})(PeriodeType || (exports.PeriodeType = PeriodeType = {}));
class DashboardRequestDto {
}
exports.DashboardRequestDto = DashboardRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01',
        description: "'Date de début de la période d'analyse'",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DashboardRequestDto.prototype, "dateDebut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-12-31',
        description: "'Date de fin de la période d'analyse'",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DashboardRequestDto.prototype, "dateFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: PeriodeType,
        example: 'mois',
        description: "'Type de période pour l'agrégation des données'",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PeriodeType),
    __metadata("design:type", String)
], DashboardRequestDto.prototype, "periode", void 0);
//# sourceMappingURL=dashboard-request.dto.js.map