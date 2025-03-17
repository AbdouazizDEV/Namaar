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
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const clients_service_1 = require("./clients.service");
const update_client_status_dto_1 = require("./dto/update-client-status.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
class ClientDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6072f329a01c7d001bcf7812' }),
    __metadata("design:type", String)
], ClientDto.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6072f329a01c7d001bcf7813' }),
    __metadata("design:type", String)
], ClientDto.prototype, "utilisateur_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01 23 45 67 89' }),
    __metadata("design:type", String)
], ClientDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Avenue de la République, 75011 Paris' }),
    __metadata("design:type", String)
], ClientDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'actif' }),
    __metadata("design:type", String)
], ClientDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'standard' }),
    __metadata("design:type", String)
], ClientDto.prototype, "type", void 0);
class ClientWithUserDto extends ClientDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            _id: '6072f329a01c7d001bcf7813',
            nom: 'Ngoor',
            prenom: 'FAYE',
            email: 'FAYE.Ngoor@example.com',
        },
    }),
    __metadata("design:type", Object)
], ClientWithUserDto.prototype, "utilisateur_id", void 0);
class ClientStatsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150 }),
    __metadata("design:type", Number)
], ClientStatsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120 }),
    __metadata("design:type", Number)
], ClientStatsDto.prototype, "actifs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30 }),
    __metadata("design:type", Number)
], ClientStatsDto.prototype, "inactifs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45 }),
    __metadata("design:type", Number)
], ClientStatsDto.prototype, "nouveauxCeMois", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15 }),
    __metadata("design:type", Number)
], ClientStatsDto.prototype, "tauxCroissance", void 0);
let ClientsController = class ClientsController {
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    async getAllClients() {
        return this.clientsService.getAllClients();
    }
    async getClientStats() {
        return this.clientsService.getClientStats();
    }
    async getClientById(id) {
        return this.clientsService.getClientById(id);
    }
    async updateClientStatus(id, updateClientStatusDto) {
        return this.clientsService.updateClientStatus(id, updateClientStatusDto);
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer tous les clients' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste de tous les clients récupérée avec succès.',
        type: [ClientWithUserDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "getAllClients", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les statistiques des clients' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistiques clients récupérées avec succès.',
        type: ClientStatsDto,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "getClientStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer un client par son ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du client', type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Client récupéré avec succès.',
        type: ClientWithUserDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "getClientById", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: "'Mettre à jour le statut d'un client'" }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du client', type: String }),
    (0, swagger_1.ApiBody)({ type: update_client_status_dto_1.UpdateClientStatusDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statut du client mis à jour avec succès.',
        type: ClientDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_client_status_dto_1.UpdateClientStatusDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "updateClientStatus", null);
exports.ClientsController = ClientsController = __decorate([
    (0, swagger_1.ApiTags)('clients'),
    (0, common_1.Controller)('clients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], ClientsController);
//# sourceMappingURL=clients.controller.js.map