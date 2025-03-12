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
exports.OffersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const offre_schema_1 = require("../schemas/offre.schema");
const voiture_schema_1 = require("../schemas/voiture.schema");
let OffersService = class OffersService {
    constructor(offreModel, voitureModel) {
        this.offreModel = offreModel;
        this.voitureModel = voitureModel;
    }
    async createOffer(createOfferDto) {
        if (new Date(createOfferDto.date_fin) <= new Date(createOfferDto.date_debut)) {
            throw new common_1.BadRequestException('La date de fin doit être postérieure à la date de début');
        }
        if (createOfferDto.voitures && createOfferDto.voitures.length > 0) {
            const vehicleCount = await this.voitureModel.countDocuments({
                _id: { $in: createOfferDto.voitures },
            });
            if (vehicleCount !== createOfferDto.voitures.length) {
                throw new common_1.BadRequestException("Certaines voitures spécifiées n'existent pas");
            }
        }
        if (!createOfferDto.code_promo) {
            createOfferDto.code_promo = this.generatePromoCode();
        }
        const newOffer = new this.offreModel(createOfferDto);
        return newOffer.save();
    }
    async getAllOffers() {
        return this.offreModel.find().populate('voitures').exec();
    }
    async getOfferById(id) {
        const offer = await this.offreModel
            .findById(id)
            .populate('voitures')
            .exec();
        if (!offer) {
            throw new common_1.NotFoundException(`Offre avec l'ID ${id} non trouvée`);
        }
        return offer;
    }
    async updateOffer(id, updateOfferDto) {
        if (updateOfferDto.date_debut && updateOfferDto.date_fin) {
            if (new Date(updateOfferDto.date_fin) <= new Date(updateOfferDto.date_debut)) {
                throw new common_1.BadRequestException('La date de fin doit être postérieure à la date de début');
            }
        }
        else if (updateOfferDto.date_debut) {
            const offer = await this.offreModel.findById(id);
            if (new Date(offer.date_fin) <= new Date(updateOfferDto.date_debut)) {
                throw new common_1.BadRequestException('La date de fin doit être postérieure à la date de début');
            }
        }
        else if (updateOfferDto.date_fin) {
            const offer = await this.offreModel.findById(id);
            if (new Date(updateOfferDto.date_fin) <= new Date(offer.date_debut)) {
                throw new common_1.BadRequestException('La date de fin doit être postérieure à la date de début');
            }
        }
        if (updateOfferDto.voitures && updateOfferDto.voitures.length > 0) {
            const vehicleCount = await this.voitureModel.countDocuments({
                _id: { $in: updateOfferDto.voitures },
            });
            if (vehicleCount !== updateOfferDto.voitures.length) {
                throw new common_1.BadRequestException("Certaines voitures spécifiées n'existent pas");
            }
        }
        const updatedOffer = await this.offreModel
            .findByIdAndUpdate(id, updateOfferDto, { new: true })
            .populate('voitures')
            .exec();
        if (!updatedOffer) {
            throw new common_1.NotFoundException(`Offre avec l'ID ${id} non trouvée`);
        }
        return updatedOffer;
    }
    async deleteOffer(id) {
        const result = await this.offreModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Offre avec l'ID ${id} non trouvée`);
        }
        return { message: 'Offre supprimée avec succès' };
    }
    async filterOffers(filterDto) {
        const query = {};
        if (filterDto.statut) {
            query.statut = filterDto.statut;
        }
        if (filterDto.date_debut) {
            query.date_debut = { $gte: new Date(filterDto.date_debut) };
        }
        if (filterDto.date_fin) {
            query.date_fin = { $lte: new Date(filterDto.date_fin) };
        }
        if (filterDto.date_debut_min) {
            query.date_debut = { ...query.date_debut, $gte: new Date(filterDto.date_debut_min) };
        }
        if (filterDto.date_fin_max) {
            query.date_fin = { ...query.date_fin, $lte: new Date(filterDto.date_fin_max) };
        }
        return this.offreModel.find(query).populate('voitures').exec();
    }
    async getActiveOffers() {
        const currentDate = new Date();
        return this.offreModel
            .find({
            statut: 'active',
            date_debut: { $lte: currentDate },
            date_fin: { $gte: currentDate },
        })
            .populate('voitures')
            .exec();
    }
    generatePromoCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
};
exports.OffersService = OffersService;
exports.OffersService = OffersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(offre_schema_1.Offre.name)),
    __param(1, (0, mongoose_1.InjectModel)(voiture_schema_1.Voiture.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], OffersService);
//# sourceMappingURL=offers.service.js.map