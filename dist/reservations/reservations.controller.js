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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const reservations_service_1 = require("./reservations.service");
const payment_service_1 = require("./payment.service");
const options_service_1 = require("./options.service");
const create_reservation_dto_1 = require("./dto/create-reservation.dto");
const update_reservation_dto_1 = require("./dto/update-reservation.dto");
const filter_reservations_dto_1 = require("./dto/filter-reservations.dto");
const reservation_step_dto_1 = require("./dto/reservation-step.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ReservationsController = class ReservationsController {
    constructor(reservationsService, paymentService, optionsService) {
        this.reservationsService = reservationsService;
        this.paymentService = paymentService;
        this.optionsService = optionsService;
    }
    async createReservation(req, createReservationDto) {
        if (req.user.role === 'gérant' && createReservationDto.utilisateur_id) {
            return this.reservationsService.createReservation(req.user._id, createReservationDto, true);
        }
        return this.reservationsService.createReservation(req.user._id, createReservationDto);
    }
    async getAllReservations() {
        return this.reservationsService.getAllReservations();
    }
    async filterReservations(filterDto) {
        return this.reservationsService.filterReservations(filterDto);
    }
    async getUserReservations(req) {
        return this.reservationsService.getUserReservations(req.user._id);
    }
    async getClientReservations(clientId) {
        return this.reservationsService.getClientReservations(clientId);
    }
    async getReservationById(id, req) {
        const reservation = await this.reservationsService.getReservationById(id);
        if (req.user.role !== 'gérant') {
            const userId = req.user._id.toString();
            let reservationUserId;
            if (typeof reservation.utilisateur_id === 'object' &&
                reservation.utilisateur_id !== null) {
                reservationUserId = reservation.utilisateur_id._id?.toString() || '';
            }
            else {
                reservationUserId = String(reservation.utilisateur_id);
            }
            if (userId !== reservationUserId) {
                throw new common_1.UnauthorizedException("Vous n'êtes pas autorisé à voir cette réservation");
            }
        }
        return reservation;
    }
    async updateReservation(id, updateReservationDto, req) {
        const reservation = await this.reservationsService.getReservationById(id);
        if (req.user.role !== 'gérant') {
            const userId = req.user._id.toString();
            let reservationUserId;
            if (typeof reservation.utilisateur_id === 'object' && reservation.utilisateur_id !== null) {
                reservationUserId = reservation.utilisateur_id._id?.toString() || '';
            }
            else {
                reservationUserId = String(reservation.utilisateur_id);
            }
            if (userId !== reservationUserId) {
                throw new common_1.UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette réservation');
            }
            delete updateReservationDto.statut;
        }
        return this.reservationsService.updateReservation(id, updateReservationDto);
    }
    async changeReservationStatus(id, statut) {
        return this.reservationsService.changeReservationStatus(id, statut);
    }
    async deleteReservation(id, req) {
        const reservation = await this.reservationsService.getReservationById(id);
        if (req.user.role !== 'gérant') {
            const userId = req.user._id.toString();
            let reservationUserId;
            if (typeof reservation.utilisateur_id === 'object' && reservation.utilisateur_id !== null) {
                reservationUserId = reservation.utilisateur_id._id?.toString() || '';
            }
            else {
                reservationUserId = String(reservation.utilisateur_id);
            }
            if (userId !== reservationUserId) {
                throw new common_1.UnauthorizedException('Vous n\'êtes pas autorisé à supprimer cette réservation');
            }
        }
        return this.reservationsService.deleteReservation(id);
    }
    async startReservationProcess(req, createReservationDto) {
        return this.reservationsService.startReservationProcess(req.user._id, createReservationDto);
    }
    async moveToNextStep(req, stepDto) {
        return this.reservationsService.moveToNextStep(req.user._id, stepDto);
    }
    async selectOptions(req, optionsDto) {
        return this.reservationsService.selectOptions(req.user._id, optionsDto);
    }
    async getReservationSummary(req, id) {
        return this.reservationsService.getReservationSummary(req.user._id, id);
    }
    async applyPromoCode(req, id, codePromo) {
        return this.reservationsService.applyPromoCode(req.user._id, id, codePromo);
    }
    async processPayment(req, paymentDto) {
        return this.paymentService.processPayment(req.user._id, paymentDto);
    }
    getDocumentId(doc) {
        if (!doc)
            return '';
        if (typeof doc === 'string')
            return doc;
        if (doc._id)
            return doc._id.toString();
        return '';
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_reservation_dto_1.CreateReservationDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "createReservation", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getAllReservations", null);
__decorate([
    (0, common_1.Get)('filter'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_reservations_dto_1.FilterReservationsDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "filterReservations", null);
__decorate([
    (0, common_1.Get)('my-reservations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getUserReservations", null);
__decorate([
    (0, common_1.Get)('client/:clientId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getClientReservations", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getReservationById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reservation_dto_1.UpdateReservationDto, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "updateReservation", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('statut', common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "changeReservationStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "deleteReservation", null);
__decorate([
    (0, common_1.Post)('process/start'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)('client'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_reservation_dto_1.CreateReservationDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "startReservationProcess", null);
__decorate([
    (0, common_1.Put)('process/step'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reservation_step_dto_1.ReservationStepDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "moveToNextStep", null);
__decorate([
    (0, common_1.Put)('process/options'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reservation_step_dto_1.OptionsSelectionDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "selectOptions", null);
__decorate([
    (0, common_1.Get)('process/summary/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getReservationSummary", null);
__decorate([
    (0, common_1.Put)('process/promo-code/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('code_promo', common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "applyPromoCode", null);
__decorate([
    (0, common_1.Post)('process/payment'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reservation_step_dto_1.PaymentDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "processPayment", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)('reservations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService,
        payment_service_1.PaymentService,
        options_service_1.OptionsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map