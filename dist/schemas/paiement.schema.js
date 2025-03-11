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
exports.PaiementSchema = exports.Paiement = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const facture_schema_1 = require("./facture.schema");
const reservation_schema_1 = require("./reservation.schema");
let Paiement = class Paiement {
};
exports.Paiement = Paiement;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Facture', required: true }),
    __metadata("design:type", facture_schema_1.Facture)
], Paiement.prototype, "facture_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true,
    }),
    __metadata("design:type", reservation_schema_1.Reservation)
], Paiement.prototype, "reservation_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Paiement.prototype, "montant", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Paiement.prototype, "methode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Paiement.prototype, "reference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Paiement.prototype, "date_paiement", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['en_attente', 'validé', 'refusé'], default: 'validé' }),
    __metadata("design:type", String)
], Paiement.prototype, "statut", void 0);
exports.Paiement = Paiement = __decorate([
    (0, mongoose_1.Schema)()
], Paiement);
exports.PaiementSchema = mongoose_1.SchemaFactory.createForClass(Paiement);
//# sourceMappingURL=paiement.schema.js.map