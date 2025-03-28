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
exports.ReservationSchema = exports.Reservation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./user.schema");
const voiture_schema_1 = require("./voiture.schema");
const offre_schema_1 = require("./offre.schema");
let Reservation = class Reservation {
};
exports.Reservation = Reservation;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", user_schema_1.User)
], Reservation.prototype, "utilisateur_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Voiture', required: true }),
    __metadata("design:type", voiture_schema_1.Voiture)
], Reservation.prototype, "voiture_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Reservation.prototype, "date_debut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Reservation.prototype, "date_fin", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['en_attente', 'confirmee', 'annulee', 'terminee'],
        default: 'en_attente',
    }),
    __metadata("design:type", String)
], Reservation.prototype, "statut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Reservation.prototype, "prix_total", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Offre' }),
    __metadata("design:type", offre_schema_1.Offre)
], Reservation.prototype, "offre_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Reservation.prototype, "date_reservation", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            { type: mongoose_2.Schema.Types.ObjectId, ref: 'OptionSupplementaire' },
        ],
    }),
    __metadata("design:type", Array)
], Reservation.prototype, "options", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Reservation.prototype, "code_promo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], Reservation.prototype, "etape_reservation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Reservation.prototype, "acompte_paye", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Reservation.prototype, "montant_acompte", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Reservation.prototype, "commentaires", void 0);
exports.Reservation = Reservation = __decorate([
    (0, mongoose_1.Schema)()
], Reservation);
exports.ReservationSchema = mongoose_1.SchemaFactory.createForClass(Reservation);
//# sourceMappingURL=reservation.schema.js.map