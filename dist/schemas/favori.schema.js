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
exports.FavoriOffreSchema = exports.FavoriOffre = exports.FavoriVoitureSchema = exports.FavoriVoiture = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./user.schema");
const voiture_schema_1 = require("./voiture.schema");
const offre_schema_1 = require("./offre.schema");
let FavoriVoiture = class FavoriVoiture {
};
exports.FavoriVoiture = FavoriVoiture;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", user_schema_1.User)
], FavoriVoiture.prototype, "utilisateur_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Voiture', required: true }),
    __metadata("design:type", voiture_schema_1.Voiture)
], FavoriVoiture.prototype, "voiture_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], FavoriVoiture.prototype, "date_ajout", void 0);
exports.FavoriVoiture = FavoriVoiture = __decorate([
    (0, mongoose_1.Schema)()
], FavoriVoiture);
exports.FavoriVoitureSchema = mongoose_1.SchemaFactory.createForClass(FavoriVoiture);
let FavoriOffre = class FavoriOffre {
};
exports.FavoriOffre = FavoriOffre;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", user_schema_1.User)
], FavoriOffre.prototype, "utilisateur_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Offre', required: true }),
    __metadata("design:type", offre_schema_1.Offre)
], FavoriOffre.prototype, "offre_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], FavoriOffre.prototype, "date_ajout", void 0);
exports.FavoriOffre = FavoriOffre = __decorate([
    (0, mongoose_1.Schema)()
], FavoriOffre);
exports.FavoriOffreSchema = mongoose_1.SchemaFactory.createForClass(FavoriOffre);
//# sourceMappingURL=favori.schema.js.map