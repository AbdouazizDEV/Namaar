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
exports.FavorisController = void 0;
const common_1 = require("@nestjs/common");
const favoris_service_1 = require("./favoris.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const create_favori_dto_1 = require("./dto/create-favori.dto");
const get_favoris_dto_1 = require("./dto/get-favoris.dto");
let FavorisController = class FavorisController {
    constructor(favorisService) {
        this.favorisService = favorisService;
    }
    async getFavorisVoitures(req, query) {
        const userId = req.user._id;
        return this.favorisService.getFavorisVoitures(userId, query.populateDetails);
    }
    async addFavoriVoiture(req, createFavoriDto) {
        console.log('req.user:', req.user);
        const userId = req.user._id || req.user.id || req.user._id;
        console.log('userId extrait:', userId);
        return this.favorisService.addFavoriVoiture(userId, createFavoriDto.voiture_id);
    }
    async removeFavoriVoiture(req, voitureId) {
        const userId = req.user.userId;
        return this.favorisService.removeFavoriVoiture(userId, voitureId);
    }
    async checkVoitureFavori(req, voitureId) {
        const userId = req.user._id;
        return this.favorisService.checkVoitureFavori(userId, voitureId);
    }
    async getFavorisOffres(req, query) {
        const userId = req.user._id;
        return this.favorisService.getFavorisOffres(userId, query.populateDetails);
    }
    async addFavoriOffre(req, createFavoriDto) {
        const userId = req.user._id;
        return this.favorisService.addFavoriOffre(userId, createFavoriDto.offre_id);
    }
    async removeFavoriOffre(req, offreId) {
        const userId = req.user._id;
        return this.favorisService.removeFavoriOffre(userId, offreId);
    }
    async checkOffreFavori(req, offreId) {
        const userId = req.user._id;
        return this.favorisService.checkOffreFavori(userId, offreId);
    }
    async getNotifications(req) {
        const userId = req.user._id;
        return this.favorisService.getNotifications(userId);
    }
    async marquerNotificationLue(req, notificationId) {
        const userId = req.user._id;
        return this.favorisService.marquerNotificationLue(userId, notificationId);
    }
    async marquerToutesNotificationsLues(req) {
        const userId = req.user._id;
        return this.favorisService.marquerToutesNotificationsLues(userId);
    }
    async supprimerNotification(req, notificationId) {
        const userId = req.user._id;
        return this.favorisService.supprimerNotification(userId, notificationId);
    }
    async supprimerToutesNotifications(req) {
        const userId = req.user._id;
        return this.favorisService.supprimerToutesNotifications(userId);
    }
};
exports.FavorisController = FavorisController;
__decorate([
    (0, common_1.Get)('voitures'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_favoris_dto_1.GetFavorisDto]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "getFavorisVoitures", null);
__decorate([
    (0, common_1.Post)('voitures'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_favori_dto_1.CreateFavoriVoitureDto]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "addFavoriVoiture", null);
__decorate([
    (0, common_1.Delete)('voitures/:id'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "removeFavoriVoiture", null);
__decorate([
    (0, common_1.Get)('voitures/check/:id'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "checkVoitureFavori", null);
__decorate([
    (0, common_1.Get)('offres'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_favoris_dto_1.GetFavorisDto]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "getFavorisOffres", null);
__decorate([
    (0, common_1.Post)('offres'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_favori_dto_1.CreateFavoriOffreDto]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "addFavoriOffre", null);
__decorate([
    (0, common_1.Delete)('offres/:id'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "removeFavoriOffre", null);
__decorate([
    (0, common_1.Get)('offres/check/:id'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "checkOffreFavori", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Post)('notifications/:id/marquer-lu'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "marquerNotificationLue", null);
__decorate([
    (0, common_1.Post)('notifications/marquer-tout-lu'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "marquerToutesNotificationsLues", null);
__decorate([
    (0, common_1.Delete)('notifications/:id'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "supprimerNotification", null);
__decorate([
    (0, common_1.Delete)('notifications'),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FavorisController.prototype, "supprimerToutesNotifications", null);
exports.FavorisController = FavorisController = __decorate([
    (0, common_1.Controller)('favoris'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [favoris_service_1.FavorisService])
], FavorisController);
//# sourceMappingURL=favoris.controller.js.map