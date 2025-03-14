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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const public_service_1 = require("./public.service");
const search_vehicles_dto_1 = require("./dto/search-vehicles.dto");
const public_decorator_1 = require("../auth/public.decorator");
const swagger_1 = require("@nestjs/swagger");
let PublicController = class PublicController {
    constructor(publicService) {
        this.publicService = publicService;
    }
    async getAllVehicles(searchDto) {
        return this.publicService.searchVehicles(searchDto);
    }
    async getVehicleDetails(id) {
        const vehicle = await this.publicService.getVehicleDetails(id);
        if (!vehicle) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        return vehicle;
    }
    async getVehicleAvailability(id, dateDebut, dateFin) {
        const availability = await this.publicService.getVehicleAvailability(id, dateDebut ? new Date(dateDebut) : undefined, dateFin ? new Date(dateFin) : undefined);
        return availability;
    }
    async getVehicleImages(id) {
        const images = await this.publicService.getVehicleImages(id);
        if (!images || images.length === 0) {
            throw new common_1.NotFoundException(`Aucune image trouvée pour le véhicule avec l'ID ${id}`);
        }
        return images;
    }
    async getActiveOffers() {
        return this.publicService.getActiveOffers();
    }
    async getOfferDetails(id) {
        const offer = await this.publicService.getOfferDetails(id);
        if (!offer) {
            throw new common_1.NotFoundException(`Offre avec l'ID ${id} non trouvée`);
        }
        return offer;
    }
    async searchVehicles(searchDto) {
        return this.publicService.searchVehicles(searchDto);
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('vehicles'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_vehicles_dto_1.SearchVehiclesDto]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getAllVehicles", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('vehicles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les détails d\'un véhicule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails du véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Véhicule non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getVehicleDetails", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('vehicles/:id/availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir la disponibilité d\'un véhicule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du véhicule' }),
    (0, swagger_1.ApiQuery)({ name: 'dateDebut', required: false, description: 'Date de début (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFin', required: false, description: 'Date de fin (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Disponibilité du véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Véhicule non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('dateDebut')),
    __param(2, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getVehicleAvailability", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('vehicles/:id/images'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les images d\'un véhicule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Images du véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Véhicule non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getVehicleImages", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('offers'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir toutes les offres actives' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des offres actives' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getActiveOffers", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('offers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les détails d\'une offre' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'offre' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails de l\'offre' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Offre non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getOfferDetails", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Rechercher des véhicules avec filtres' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Résultats de la recherche' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_vehicles_dto_1.SearchVehiclesDto]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "searchVehicles", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], PublicController);
//# sourceMappingURL=public.controller.js.map