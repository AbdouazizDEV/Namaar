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
exports.FactureSchema = exports.Facture = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Facture = class Facture {
};
exports.Facture = Facture;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true,
    }),
    __metadata("design:type", Object)
], Facture.prototype, "reservation_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Client', required: false }),
    __metadata("design:type", Object)
], Facture.prototype, "client_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Facture.prototype, "date_emission", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Facture.prototype, "date_echeance", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Facture.prototype, "montant_total", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Facture.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['en_attente', 'payée', 'annulée'], default: 'en_attente' }),
    __metadata("design:type", String)
], Facture.prototype, "statut", void 0);
exports.Facture = Facture = __decorate([
    (0, mongoose_1.Schema)()
], Facture);
exports.FactureSchema = mongoose_1.SchemaFactory.createForClass(Facture);
//# sourceMappingURL=facture.schema.js.map