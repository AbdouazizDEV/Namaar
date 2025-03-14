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
exports.LocationsController = void 0;
const common_1 = require("@nestjs/common");
const locations_service_1 = require("./locations.service");
const start_contract_dto_1 = require("./dto/start-contract.dto");
const end_contract_dto_1 = require("./dto/end-contract.dto");
const payment_dto_1 = require("./dto/payment.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let LocationsController = class LocationsController {
    constructor(locationsService) {
        this.locationsService = locationsService;
    }
    async getAllLocations() {
        return this.locationsService.getAllLocations();
    }
    async getLocationById(id) {
        return this.locationsService.getLocationById(id);
    }
    async startContract(startContractDto) {
        return this.locationsService.startContract(startContractDto);
    }
    async endContract(id, endContractDto) {
        return this.locationsService.endContract(id, endContractDto);
    }
    async createPayment(reservationId, createPaymentDto) {
        return this.locationsService.createPayment(reservationId, createPaymentDto);
    }
    async getAllInvoices() {
        return this.locationsService.getInvoices();
    }
    async getClientInvoices(clientId) {
        return this.locationsService.getInvoices(clientId);
    }
    async getInvoiceById(id) {
        return this.locationsService.getInvoiceById(id);
    }
    async getAllPayments() {
        return this.locationsService.getPayments();
    }
    async getInvoicePayments(factureId) {
        return this.locationsService.getPayments(factureId);
    }
    async generateInvoicePdf(id, res) {
        const pdfPath = await this.locationsService.generateInvoicePdf(id);
        return res.sendFile(pdfPath, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="facture-${id}.pdf"`,
            },
        });
    }
    async sendInvoiceByEmail(id, emailData) {
        return this.locationsService.sendInvoiceByEmail(id, emailData.email);
    }
    async createTestInvoice(testData) {
        return this.locationsService.createTestInvoice(testData);
    }
};
exports.LocationsController = LocationsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getAllLocations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getLocationById", null);
__decorate([
    (0, common_1.Post)('start'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [start_contract_dto_1.StartContractDto]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "startContract", null);
__decorate([
    (0, common_1.Put)(':id/end'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, end_contract_dto_1.EndContractDto]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "endContract", null);
__decorate([
    (0, common_1.Post)('reservations/:reservationId/payments'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('reservationId')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('factures'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getAllInvoices", null);
__decorate([
    (0, common_1.Get)('factures/client/:clientId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getClientInvoices", null);
__decorate([
    (0, common_1.Get)('factures/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getInvoiceById", null);
__decorate([
    (0, common_1.Get)('paiements'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getAllPayments", null);
__decorate([
    (0, common_1.Get)('factures/:factureId/paiements'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('factureId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getInvoicePayments", null);
__decorate([
    (0, common_1.Get)('factures/:id/pdf'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "generateInvoicePdf", null);
__decorate([
    (0, common_1.Post)('factures/:id/send-email'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "sendInvoiceByEmail", null);
__decorate([
    (0, common_1.Post)('test/create-invoice'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('gérant'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "createTestInvoice", null);
exports.LocationsController = LocationsController = __decorate([
    (0, common_1.Controller)('locations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [locations_service_1.LocationsService])
], LocationsController);
//# sourceMappingURL=locations.controller.js.map