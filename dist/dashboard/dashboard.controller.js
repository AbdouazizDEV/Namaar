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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_overview_dto_1 = require("./dto/dashboard-overview.dto");
const statistiques_periode_dto_1 = require("./dto/statistiques-periode.dto");
const indicateurs_performance_dto_1 = require("./dto/indicateurs-performance.dto");
const alerte_dto_1 = require("./dto/alerte.dto");
const dashboard_request_dto_1 = require("./dto/dashboard-request.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
class RevenusMensuelsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        description: 'Labels des mois',
    }),
    __metadata("design:type", Array)
], RevenusMensuelsDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [120000, 150000, 130000, 180000, 200000],
        description: 'Revenus mensuels en FCFA',
    }),
    __metadata("design:type", Array)
], RevenusMensuelsDto.prototype, "revenus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 156000, description: 'Revenu mensuel moyen en FCFA' }),
    __metadata("design:type", Number)
], RevenusMensuelsDto.prototype, "moyenneMensuelle", void 0);
class TauxOccupationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        description: 'Labels des mois',
    }),
    __metadata("design:type", Array)
], TauxOccupationDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [65.3, 70.2, 62.5, 72.8, 68.1],
        description: "'Taux d'occupation en pourcentage'",
    }),
    __metadata("design:type", Array)
], TauxOccupationDto.prototype, "tauxOccupation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 67.8,
        description: "'Taux d'occupation moyen en pourcentage'",
    }),
    __metadata("design:type", Number)
], TauxOccupationDto.prototype, "moyenneOccupation", void 0);
class VoituresPerformanceDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [
            { id: '123', marque: 'Toyota', modele: 'Corolla', performance: 85.2 },
            { id: '124', marque: 'Renault', modele: 'Clio', performance: 72.1 },
        ],
        description: 'Performance des véhicules',
    }),
    __metadata("design:type", Array)
], VoituresPerformanceDto.prototype, "vehicules", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 78.6,
        description: 'Performance moyenne en pourcentage',
    }),
    __metadata("design:type", Number)
], VoituresPerformanceDto.prototype, "moyennePerformance", void 0);
class ClientsActifsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        description: 'Labels des mois',
    }),
    __metadata("design:type", Array)
], ClientsActifsDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [120, 132, 128, 145, 152],
        description: 'Nombre de clients actifs par mois',
    }),
    __metadata("design:type", Array)
], ClientsActifsDto.prototype, "clientsActifs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12.5,
        description: 'Taux de croissance en pourcentage',
    }),
    __metadata("design:type", Number)
], ClientsActifsDto.prototype, "tauxCroissance", void 0);
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getOverview(requestDto) {
        return this.dashboardService.getOverview(requestDto);
    }
    async getStatistiques(requestDto) {
        return this.dashboardService.getStatistiques(requestDto);
    }
    async getIndicateursPerformance(requestDto) {
        return this.dashboardService.getIndicateursPerformance(requestDto);
    }
    async getAlertes() {
        return this.dashboardService.getAlertes();
    }
    async marquerAlerteTraitee(alerteId) {
        return this.dashboardService.marquerAlerteTraitee(alerteId);
    }
    async getRevenusMensuels(requestDto) {
        return this.dashboardService.getRevenusMensuels(requestDto);
    }
    async getTauxOccupation(requestDto) {
        return this.dashboardService.getTauxOccupation(requestDto);
    }
    async getVoituresPerformances(requestDto) {
        return this.dashboardService.getVoituresPerformances(requestDto);
    }
    async getClientsActifs(requestDto) {
        return this.dashboardService.getClientsActifs(requestDto);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({
        summary: "'Récupérer une vue d'ensemble du tableau de bord'",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "'Vue d'ensemble récupérée avec succès'",
        type: dashboard_overview_dto_1.DashboardOverviewDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('statistiques'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les statistiques par période' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistiques récupérées avec succès',
        type: statistiques_periode_dto_1.StatistiquesPeriodeDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getStatistiques", null);
__decorate([
    (0, common_1.Get)('performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les indicateurs de performance' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Indicateurs de performance récupérés avec succès',
        type: indicateurs_performance_dto_1.IndicateursPerformanceDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getIndicateursPerformance", null);
__decorate([
    (0, common_1.Get)('alertes'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer toutes les alertes' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Alertes récupérées avec succès',
        type: alerte_dto_1.AlertesDto,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAlertes", null);
__decorate([
    (0, common_1.Post)('alertes/:id/traiter'),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer une alerte comme traitée' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: "'Identifiant de l'alerte'",
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Alerte marquée comme traitée avec succès',
        type: alerte_dto_1.AlertesDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "marquerAlerteTraitee", null);
__decorate([
    (0, common_1.Get)('revenus-mensuels'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les revenus mensuels' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Revenus mensuels récupérés avec succès',
        type: RevenusMensuelsDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRevenusMensuels", null);
__decorate([
    (0, common_1.Get)('taux-occupation'),
    (0, swagger_1.ApiOperation)({ summary: "'Récupérer le taux d'occupation des véhicules'" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "'Taux d'occupation récupéré avec succès'",
        type: TauxOccupationDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTauxOccupation", null);
__decorate([
    (0, common_1.Get)('voitures-performances'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les performances des véhicules' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performances des véhicules récupérées avec succès',
        type: VoituresPerformanceDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getVoituresPerformances", null);
__decorate([
    (0, common_1.Get)('clients-actifs'),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer les statistiques sur les clients actifs',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistiques des clients actifs récupérées avec succès',
        type: ClientsActifsDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getClientsActifs", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant', 'admin'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map