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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const reservation_schema_1 = require("../schemas/reservation.schema");
const voiture_schema_1 = require("../schemas/voiture.schema");
const offre_schema_1 = require("../schemas/offre.schema");
const user_schema_1 = require("../schemas/user.schema");
const option_supplementaire_schema_1 = require("../schemas/option-supplementaire.schema");
const options_service_1 = require("./options.service");
let ReservationsService = class ReservationsService {
    constructor(reservationModel, voitureModel, offreModel, userModel, optionModel, optionsService) {
        this.reservationModel = reservationModel;
        this.voitureModel = voitureModel;
        this.offreModel = offreModel;
        this.userModel = userModel;
        this.optionModel = optionModel;
        this.optionsService = optionsService;
    }
    async createReservation(userId, createReservationDto, isManager = false) {
        let clientId = userId;
        if (isManager && createReservationDto.utilisateur_id) {
            const client = await this.userModel.findById(createReservationDto.utilisateur_id);
            if (!client) {
                throw new common_1.NotFoundException(`Client avec l'ID ${createReservationDto.utilisateur_id} non trouvé`);
            }
            clientId = createReservationDto.utilisateur_id;
        }
        const user = await this.userModel.findById(clientId);
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${clientId} non trouvé`);
        }
        const vehicle = await this.voitureModel.findById(createReservationDto.voiture_id);
        if (!vehicle) {
            throw new common_1.NotFoundException(`Voiture avec l'ID ${createReservationDto.voiture_id} non trouvée`);
        }
        if (!vehicle.disponibilite) {
            throw new common_1.BadRequestException("Cette voiture n'est pas disponible à la location");
        }
        const dateDebut = new Date(createReservationDto.date_debut);
        const dateFin = new Date(createReservationDto.date_fin);
        const now = new Date();
        if (dateDebut < now) {
            throw new common_1.BadRequestException('La date de début doit être dans le futur');
        }
        if (dateFin <= dateDebut) {
            throw new common_1.BadRequestException('La date de fin doit être postérieure à la date de début');
        }
        const reservationsExistantes = await this.reservationModel.find({
            voiture_id: createReservationDto.voiture_id,
            statut: { $in: ['en_attente', 'confirmee'] },
            $or: [
                {
                    date_debut: { $lte: dateFin },
                    date_fin: { $gte: dateDebut },
                },
            ],
        });
        if (reservationsExistantes.length > 0) {
            throw new common_1.ConflictException('Cette voiture est déjà réservée pour cette période');
        }
        let prixTotal = createReservationDto.prix_total;
        if (!prixTotal) {
            const nbJours = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 3600 * 24));
            prixTotal = vehicle.prix_location * nbJours;
            if (createReservationDto.offre_id) {
                const offre = await this.offreModel.findById(createReservationDto.offre_id);
                if (offre) {
                    const dateActuelle = new Date();
                    if (offre.statut === 'active' &&
                        dateActuelle >= new Date(offre.date_debut) &&
                        dateActuelle <= new Date(offre.date_fin)) {
                        const vehicleId = String(vehicle._id);
                        const offreApplicable = offre.voitures.some((v) => String(v) === vehicleId);
                        if (offreApplicable) {
                            prixTotal = prixTotal * (1 - offre.reduction / 100);
                        }
                        else {
                            throw new common_1.BadRequestException("Cette offre ne s'applique pas à cette voiture");
                        }
                    }
                    else {
                        throw new common_1.BadRequestException("Cette offre n'est pas active actuellement");
                    }
                }
                else {
                    throw new common_1.NotFoundException(`Offre avec l'ID ${createReservationDto.offre_id} non trouvée`);
                }
            }
            if (createReservationDto.options &&
                createReservationDto.options.length > 0) {
                const prixOptions = await this.optionsService.calculerPrixOptions(createReservationDto.options);
                prixTotal += prixOptions;
            }
        }
        const newReservation = new this.reservationModel({
            utilisateur_id: clientId,
            voiture_id: createReservationDto.voiture_id,
            date_debut: dateDebut,
            date_fin: dateFin,
            statut: createReservationDto.statut || 'en_attente',
            prix_total: prixTotal,
            offre_id: createReservationDto.offre_id,
            date_reservation: new Date(),
            options: createReservationDto.options || [],
            etape_reservation: createReservationDto.etape_reservation || 1,
            code_promo: createReservationDto.code_promo,
            acompte_paye: createReservationDto.acompte_paye || false,
            montant_acompte: createReservationDto.montant_acompte || 0,
            commentaires: createReservationDto.commentaires,
        });
        return newReservation.save();
    }
    async startReservationProcess(userId, createReservationDto) {
        createReservationDto.etape_reservation = 1;
        return this.createReservation(userId, createReservationDto, false);
    }
    async moveToNextStep(userId, stepDto) {
        const reservation = await this.reservationModel.findById(stepDto.reservation_id);
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${stepDto.reservation_id} non trouvée`);
        }
        console.log(reservation.utilisateur_id);
        if (reservation.utilisateur_id.toString() === userId) {
            throw new common_1.BadRequestException("'Vous n'êtes pas autorisé à modifier cette réservation'");
        }
        if (reservation.statut !== 'en_attente') {
            throw new common_1.BadRequestException('Cette réservation ne peut pas être modifiée dans son état actuel');
        }
        const currentStep = reservation.etape_reservation;
        if (stepDto.etape !== currentStep + 1 && stepDto.etape !== currentStep - 1) {
            throw new common_1.BadRequestException(`Impossible de passer de l'étape ${currentStep} à l'étape ${stepDto.etape}`);
        }
        return this.reservationModel
            .findByIdAndUpdate(stepDto.reservation_id, { etape_reservation: stepDto.etape }, { new: true })
            .populate('voiture_id')
            .populate('options')
            .populate('offre_id')
            .exec();
    }
    async selectOptions(userId, optionsDto) {
        const reservation = await this.reservationModel.findById(optionsDto.reservation_id);
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${optionsDto.reservation_id} non trouvée`);
        }
        if (reservation.utilisateur_id.toString() === userId) {
            throw new common_1.BadRequestException("'Vous n'êtes pas autorisé à modifier cette réservation'");
        }
        if (reservation.statut !== 'en_attente') {
            throw new common_1.BadRequestException('Cette réservation ne peut pas être modifiée dans son état actuel');
        }
        if (reservation.etape_reservation !== 2) {
            throw new common_1.BadRequestException("'Vous devez être à l'étape de sélection des options pour effectuer cette action'");
        }
        for (const optionId of optionsDto.options_ids) {
            const option = await this.optionModel.findById(optionId);
            if (!option) {
                throw new common_1.NotFoundException(`Option avec l'ID ${optionId} non trouvée`);
            }
            if (!option.disponible) {
                throw new common_1.BadRequestException(`L'option ${option.nom} n'est pas disponible actuellement`);
            }
        }
        const vehicle = await this.voitureModel.findById(reservation.voiture_id);
        if (!vehicle) {
            throw new common_1.NotFoundException(`Voiture avec l'ID ${reservation.voiture_id} non trouvée`);
        }
        const nbJours = Math.ceil((reservation.date_fin.getTime() - reservation.date_debut.getTime()) / (1000 * 3600 * 24));
        let prixTotal = vehicle.prix_location * nbJours;
        if (reservation.offre_id) {
            const offre = await this.offreModel.findById(reservation.offre_id);
            if (offre && offre.statut === 'active') {
                const vehicleId = String(vehicle._id);
                const offreApplicable = offre.voitures.some((v) => String(v) === vehicleId);
                if (offreApplicable) {
                    prixTotal = prixTotal * (1 - offre.reduction / 100);
                }
            }
        }
        const prixOptions = await this.optionsService.calculerPrixOptions(optionsDto.options_ids);
        prixTotal += prixOptions;
        return this.reservationModel
            .findByIdAndUpdate(optionsDto.reservation_id, {
            options: optionsDto.options_ids,
            prix_total: prixTotal,
            etape_reservation: 3,
        }, { new: true })
            .populate('voiture_id')
            .populate('options')
            .populate('offre_id')
            .exec();
    }
    async getReservationSummary(userId, reservationId) {
        const reservation = await this.reservationModel.findById(reservationId)
            .populate('voiture_id')
            .populate('options')
            .populate('offre_id')
            .populate('utilisateur_id');
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${reservationId} non trouvée`);
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }
        if (reservation.utilisateur_id.toString() === userId &&
            user.role !== 'gerant') {
            throw new common_1.BadRequestException("Vous n'êtes pas autorisé à consulter cette réservation");
        }
        const montantAcompte = Math.round(reservation.prix_total * 0.3);
        return {
            reservation,
            montantAcompte,
            montantTotal: reservation.prix_total,
            nbJours: Math.ceil((reservation.date_fin.getTime() - reservation.date_debut.getTime()) /
                (1000 * 3600 * 24)),
        };
    }
    async applyPromoCode(userId, reservationId, codePromo) {
        const reservation = await this.reservationModel.findById(reservationId);
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${reservationId} non trouvée`);
        }
        if (reservation.utilisateur_id.toString() === userId) {
            throw new common_1.BadRequestException("'Vous n'êtes pas autorisé à modifier cette réservation'");
        }
        if (reservation.statut !== 'en_attente') {
            throw new common_1.BadRequestException('Cette réservation ne peut pas être modifiée dans son état actuel');
        }
        if (reservation.etape_reservation !== 3 &&
            reservation.etape_reservation !== 4) {
            throw new common_1.BadRequestException('Vous ne pouvez pas appliquer de code promo à cette étape');
        }
        const offre = await this.offreModel.findOne({
            code_promo: codePromo,
            statut: 'active',
            date_debut: { $lte: new Date() },
            date_fin: { $gte: new Date() },
        });
        const reduction = 0.1;
        const nouveauPrix = reservation.prix_total * (1 - reduction);
        return this.reservationModel
            .findByIdAndUpdate(reservationId, {
            code_promo: codePromo,
            prix_total: nouveauPrix,
        }, { new: true })
            .populate('voiture_id')
            .populate('options')
            .populate('offre_id')
            .exec();
    }
    async getClientReservations(clientId) {
        const client = await this.userModel.findById(clientId);
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'ID ${clientId} non trouvé`);
        }
        return this.reservationModel
            .find({ utilisateur_id: clientId })
            .populate('utilisateur_id', '-mot_de_passe')
            .populate('voiture_id')
            .populate('offre_id')
            .populate('options')
            .exec();
    }
    async getAllReservations() {
        return this.reservationModel
            .find()
            .populate('utilisateur_id', '-mot_de_passe')
            .populate('voiture_id')
            .populate('offre_id')
            .populate('options')
            .exec();
    }
    async getReservationById(id) {
        const reservation = await this.reservationModel
            .findById(id)
            .populate('utilisateur_id', '-mot_de_passe')
            .populate('voiture_id')
            .populate('offre_id')
            .populate('options')
            .exec();
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
        }
        return reservation;
    }
    async getUserReservations(userId) {
        return this.reservationModel
            .find({ utilisateur_id: userId })
            .populate('voiture_id')
            .populate('offre_id')
            .populate('options')
            .exec();
    }
    async updateReservation(id, updateReservationDto) {
        const reservation = await this.reservationModel.findById(id);
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
        }
        if (updateReservationDto.date_debut || updateReservationDto.date_fin) {
            const dateDebut = updateReservationDto.date_debut
                ? new Date(updateReservationDto.date_debut)
                : reservation.date_debut;
            const dateFin = updateReservationDto.date_fin
                ? new Date(updateReservationDto.date_fin)
                : reservation.date_fin;
            if (dateFin <= dateDebut) {
                throw new common_1.BadRequestException('La date de fin doit être postérieure à la date de début');
            }
            if (updateReservationDto.date_debut || updateReservationDto.date_fin) {
                const voitureId = updateReservationDto.voiture_id || reservation.voiture_id.toString();
                const reservationsExistantes = await this.reservationModel.find({
                    _id: { $ne: id },
                    voiture_id: voitureId,
                    statut: { $in: ['en_attente', 'confirmee'] },
                    date_debut: { $lte: dateFin },
                    date_fin: { $gte: dateDebut },
                });
                if (reservationsExistantes.length > 0) {
                    throw new common_1.ConflictException('Cette voiture est déjà réservée pour cette période');
                }
            }
        }
        if (updateReservationDto.voiture_id ||
            updateReservationDto.date_debut ||
            updateReservationDto.date_fin ||
            updateReservationDto.offre_id ||
            updateReservationDto.options) {
            const voitureId = updateReservationDto.voiture_id || reservation.voiture_id;
            const dateDebut = updateReservationDto.date_debut
                ? new Date(updateReservationDto.date_debut)
                : reservation.date_debut;
            const dateFin = updateReservationDto.date_fin
                ? new Date(updateReservationDto.date_fin)
                : reservation.date_fin;
            const vehicle = await this.voitureModel.findById(voitureId);
            if (!vehicle) {
                throw new common_1.NotFoundException(`Voiture avec l'ID ${voitureId} non trouvée`);
            }
            const nbJours = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 3600 * 24));
            let prixTotal = vehicle.prix_location * nbJours;
            const offreId = updateReservationDto.offre_id || reservation.offre_id;
            if (offreId) {
                const offre = await this.offreModel.findById(offreId);
                if (offre) {
                    const dateActuelle = new Date();
                    if (offre.statut === 'active' &&
                        dateActuelle >= new Date(offre.date_debut) &&
                        dateActuelle <= new Date(offre.date_fin)) {
                        const vehicleId = String(vehicle._id);
                        const isVehicleEligible = offre.voitures.some(v => String(v) === vehicleId);
                        if (isVehicleEligible) {
                            prixTotal = prixTotal * (1 - offre.reduction / 100);
                        }
                        if (updateReservationDto.code_promo && offre.code_promo === updateReservationDto.code_promo) {
                            prixTotal = prixTotal * 0.9;
                        }
                    }
                }
            }
            if (updateReservationDto.options && updateReservationDto.options.length > 0) {
                const prixOptions = await this.optionsService.calculerPrixOptions(updateReservationDto.options);
                prixTotal += prixOptions;
            }
            updateReservationDto.prix_total = prixTotal;
        }
        if (updateReservationDto.statut === 'confirmee' &&
            reservation.statut !== 'confirmee') {
            const voitureId = updateReservationDto.voiture_id || reservation.voiture_id;
            await this.voitureModel.findByIdAndUpdate(voitureId, {
                disponibilite: false,
            });
        }
        if ((updateReservationDto.statut === 'terminee' ||
            updateReservationDto.statut === 'annulee') &&
            reservation.statut === 'confirmee') {
            const voitureId = updateReservationDto.voiture_id || reservation.voiture_id;
            await this.voitureModel.findByIdAndUpdate(voitureId, {
                disponibilite: true,
            });
        }
        const updatedReservation = await this.reservationModel
            .findByIdAndUpdate(id, updateReservationDto, { new: true })
            .populate('utilisateur_id', '-mot_de_passe')
            .populate('voiture_id')
            .populate('offre_id')
            .populate('options')
            .exec();
        return updatedReservation;
    }
    async changeReservationStatus(id, statut) {
        return this.updateReservation(id, { statut });
    }
    async filterReservations(filterDto) {
        const query = {};
        if (filterDto.utilisateur_id) {
            query.utilisateur_id = filterDto.utilisateur_id;
        }
        if (filterDto.voiture_id) {
            query.voiture_id = filterDto.voiture_id;
        }
        if (filterDto.statut) {
            query.statut = filterDto.statut;
        }
        if (filterDto.date_debut_min) {
            query.date_debut = { $gte: new Date(filterDto.date_debut_min) };
        }
        if (filterDto.date_debut_max) {
            query.date_debut = { ...query.date_debut, $lte: new Date(filterDto.date_debut_max) };
        }
        if (filterDto.date_fin_min) {
            query.date_fin = { $gte: new Date(filterDto.date_fin_min) };
        }
        if (filterDto.date_fin_max) {
            query.date_fin = { ...query.date_fin, $lte: new Date(filterDto.date_fin_max) };
        }
        if (filterDto.date_reservation_min) {
            query.date_reservation = { $gte: new Date(filterDto.date_reservation_min) };
        }
        if (filterDto.date_reservation_max) {
            query.date_reservation = { ...query.date_reservation, $lte: new Date(filterDto.date_reservation_max) };
        }
        return this.reservationModel
            .find(query)
            .populate('utilisateur_id', '-mot_de_passe')
            .populate('voiture_id')
            .populate('offre_id')
            .populate('options')
            .exec();
    }
    async deleteReservation(id) {
        const reservation = await this.reservationModel.findById(id);
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
        }
        if (reservation.statut === 'confirmee') {
            await this.voitureModel.findByIdAndUpdate(reservation.voiture_id, {
                disponibilite: true,
            });
        }
        await this.reservationModel.findByIdAndDelete(id);
        return { message: 'Réservation supprimée avec succès' };
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reservation_schema_1.Reservation.name)),
    __param(1, (0, mongoose_1.InjectModel)(voiture_schema_1.Voiture.name)),
    __param(2, (0, mongoose_1.InjectModel)(offre_schema_1.Offre.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(option_supplementaire_schema_1.OptionSupplementaire.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        options_service_1.OptionsService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map