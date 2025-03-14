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
const dashboard_request_dto_1 = require("./dto/dashboard-request.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
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
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('statistiques'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getStatistiques", null);
__decorate([
    (0, common_1.Get)('performance'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getIndicateursPerformance", null);
__decorate([
    (0, common_1.Get)('alertes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAlertes", null);
__decorate([
    (0, common_1.Post)('alertes/:id/traiter'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "marquerAlerteTraitee", null);
__decorate([
    (0, common_1.Get)('revenus-mensuels'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRevenusMensuels", null);
__decorate([
    (0, common_1.Get)('taux-occupation'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTauxOccupation", null);
__decorate([
    (0, common_1.Get)('voitures-performances'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getVoituresPerformances", null);
__decorate([
    (0, common_1.Get)('clients-actifs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_request_dto_1.DashboardRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getClientsActifs", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant', 'admin'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map