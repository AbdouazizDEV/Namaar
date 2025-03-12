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
exports.OffersController = void 0;
const common_1 = require("@nestjs/common");
const offers_service_1 = require("./offers.service");
const create_offer_dto_1 = require("./dto/create-offer.dto");
const update_offer_dto_1 = require("./dto/update-offer.dto");
const filter_offers_dto_1 = require("./dto/filter-offers.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let OffersController = class OffersController {
    constructor(offersService) {
        this.offersService = offersService;
    }
    async createOffer(createOfferDto) {
        return this.offersService.createOffer(createOfferDto);
    }
    async getAllOffers() {
        return this.offersService.getAllOffers();
    }
    async getActiveOffers() {
        return this.offersService.getActiveOffers();
    }
    async filterOffers(filterDto) {
        return this.offersService.filterOffers(filterDto);
    }
    async getOfferById(id) {
        return this.offersService.getOfferById(id);
    }
    async updateOffer(id, updateOfferDto) {
        return this.offersService.updateOffer(id, updateOfferDto);
    }
    async deleteOffer(id) {
        return this.offersService.deleteOffer(id);
    }
};
exports.OffersController = OffersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_offer_dto_1.CreateOfferDto]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "createOffer", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getAllOffers", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getActiveOffers", null);
__decorate([
    (0, common_1.Get)('filter'),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_offers_dto_1.FilterOffersDto]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "filterOffers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getOfferById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_offer_dto_1.UpdateOfferDto]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "updateOffer", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "deleteOffer", null);
exports.OffersController = OffersController = __decorate([
    (0, common_1.Controller)('offers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [offers_service_1.OffersService])
], OffersController);
//# sourceMappingURL=offers.controller.js.map