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
exports.SearchVehiclesDto = exports.VehicleType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var VehicleType;
(function (VehicleType) {
    VehicleType["BERLINE"] = "berline";
    VehicleType["SUV"] = "suv";
    VehicleType["CITADINE"] = "citadine";
    VehicleType["UTILITAIRE"] = "utilitaire";
    VehicleType["LUXURY"] = "luxe";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
class SearchVehiclesDto {
}
exports.SearchVehiclesDto = SearchVehiclesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchVehiclesDto.prototype, "dateDebut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchVehiclesDto.prototype, "dateFin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(VehicleType),
    __metadata("design:type", String)
], SearchVehiclesDto.prototype, "categorie", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SearchVehiclesDto.prototype, "prixMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SearchVehiclesDto.prototype, "prixMax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchVehiclesDto.prototype, "marque", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1900),
    __metadata("design:type", Number)
], SearchVehiclesDto.prototype, "anneeMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1900),
    __metadata("design:type", Number)
], SearchVehiclesDto.prototype, "anneeMax", void 0);
//# sourceMappingURL=search-vehicles.dto.js.map