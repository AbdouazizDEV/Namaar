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
let ReservationsService = class ReservationsService {
    constructor(reservationModel, voitureModel, offreModel, userModel) {
        this.reservationModel = reservationModel;
        this.voitureModel = voitureModel;
        this.offreModel = offreModel;
        this.userModel = userModel;
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
                        const offreApplicable = offre.voitures.some((v) => v.toString() === vehicle.id.toString());
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
        });
        return newReservation.save();
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
            .exec();
    }
    async getAllReservations() {
        return this.reservationModel
            .find()
            .populate('utilisateur_id', '-mot_de_passe')
            .populate('voiture_id')
            .populate('offre_id')
            .exec();
    }
    async getReservationById(id) {
        const reservation = await this.reservationModel
            .findById(id)
            .populate('utilisateur_id', '-mot_de_passe')
            .populate('voiture_id')
            .populate('offre_id')
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
            updateReservationDto.offre_id) {
            const voitureId = updateReservationDto.voiture_id || reservation.voiture_id;
            const dateDebut = updateReservationDto.date_debut
                ? new Date(updateReservationDto.date_debut)
                : reservation.date_debut;
            const dateFin = updateReservationDto.date_fin
                ? new Date(updateReservationDto.date_fin)
                : reservation.date_fin;
            const vehicle = await this.voitureModel.findById(voitureId);
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
                        if (vehicle) {
                            const isVehicleEligible = vehicle._id && offre.voitures.some(v => v.toString() === vehicle._id.toString());
                            if (isVehicleEligible) {
                                prixTotal = prixTotal * (1 - offre.reduction / 100);
                            }
                            if (updateReservationDto.code_promo && offre.code_promo === updateReservationDto.code_promo) {
                                prixTotal = prixTotal * 0.9;
                            }
                        }
                        else {
                            throw new common_1.NotFoundException(`Voiture avec l'ID ${voitureId} non trouvée`);
                        }
                    }
                }
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
            .exec();
        if (!updatedReservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
        }
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
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map