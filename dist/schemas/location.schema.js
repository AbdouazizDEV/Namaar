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
exports.LocationSchema = exports.Location = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const reservation_schema_1 = require("./reservation.schema");
let Location = class Location {
};
exports.Location = Location;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true,
    }),
    __metadata("design:type", reservation_schema_1.Reservation)
], Location.prototype, "reservation_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Location.prototype, "date_debut_reelle", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Location.prototype, "date_fin_reelle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Location.prototype, "km_depart", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Location.prototype, "km_retour", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Location.prototype, "etat_depart", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Location.prototype, "etat_retour", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Location.prototype, "frais_supplementaires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['en_cours', 'terminee', 'retard'], default: 'en_cours' }),
    __metadata("design:type", String)
], Location.prototype, "statut", void 0);
exports.Location = Location = __decorate([
    (0, mongoose_1.Schema)()
], Location);
exports.LocationSchema = mongoose_1.SchemaFactory.createForClass(Location);
//# sourceMappingURL=location.schema.js.map