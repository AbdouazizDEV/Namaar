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
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const voiture_schema_1 = require("../schemas/voiture.schema");
const image_schema_1 = require("../schemas/image.schema");
const offre_schema_1 = require("../schemas/offre.schema");
const reservation_schema_1 = require("../schemas/reservation.schema");
let PublicService = class PublicService {
    constructor(voitureModel, imageModel, offreModel, reservationModel) {
        this.voitureModel = voitureModel;
        this.imageModel = imageModel;
        this.offreModel = offreModel;
        this.reservationModel = reservationModel;
    }
    async searchVehicles(searchDto) {
        const query = { disponibilite: true };
        if (searchDto.categorie) {
            query.categorie = searchDto.categorie;
        }
        if (searchDto.marque) {
            query.marque = { $regex: new RegExp(searchDto.marque, 'i') };
        }
        if (searchDto.prixMin !== undefined || searchDto.prixMax !== undefined) {
            query.prix_location = {};
            if (searchDto.prixMin !== undefined) {
                query.prix_location.$gte = searchDto.prixMin;
            }
            if (searchDto.prixMax !== undefined) {
                query.prix_location.$lte = searchDto.prixMax;
            }
        }
        if (searchDto.anneeMin !== undefined || searchDto.anneeMax !== undefined) {
            query.annee = {};
            if (searchDto.anneeMin !== undefined) {
                query.annee.$gte = searchDto.anneeMin;
            }
            if (searchDto.anneeMax !== undefined) {
                query.annee.$lte = searchDto.anneeMax;
            }
        }
        let vehicles = await this.voitureModel.find(query).exec();
        if (searchDto.dateDebut && searchDto.dateFin) {
            const dateDebut = new Date(searchDto.dateDebut);
            const dateFin = new Date(searchDto.dateFin);
            const reservations = await this.reservationModel.find({
                voiture_id: { $in: vehicles.map(v => v._id) },
                $or: [
                    { date_debut: { $lte: dateFin }, date_fin: { $gte: dateDebut } },
                ],
                statut: { $nin: ['annulee'] },
            }).exec();
            const reservedVehicleIds = reservations.map(r => r.voiture_id.toString());
            vehicles = vehicles.filter(vehicle => !reservedVehicleIds.includes(vehicle._id.toString()));
        }
        const vehiclesWithImage = await Promise.all(vehicles.map(async (vehicle) => {
            const images = await this.imageModel.find({ voiture_id: vehicle._id }).exec();
            const mainImage = images.find(img => img['est_principale']) || images[0];
            return {
                id: vehicle._id,
                marque: vehicle.marque,
                modele: vehicle.modele,
                annee: vehicle.annee,
                prix_location: vehicle.prix_location,
                categorie: vehicle.categorie,
                image: mainImage ? mainImage['chemin'] : null,
            };
        }));
        return vehiclesWithImage;
    }
    async getVehicleDetails(id) {
        const vehicle = await this.voitureModel.findById(id).exec();
        if (!vehicle) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        const images = await this.imageModel.find({ voiture_id: id }).exec();
        const imageUrls = images.map(img => img['chemin']);
        const reservations = await this.reservationModel.find({
            voiture_id: id,
            statut: { $nin: ['annulee'] },
        }).exec();
        const nonDisponiblePeriodes = reservations.map(reservation => ({
            debut: reservation.date_debut,
            fin: reservation.date_fin,
        }));
        return {
            id: vehicle._id.toString(),
            marque: vehicle.marque,
            modele: vehicle.modele,
            annee: vehicle.annee,
            prix_location: vehicle.prix_location,
            categorie: vehicle.categorie,
            disponibilite: vehicle.disponibilite,
            description: vehicle.description,
            images: vehicle.images || imageUrls,
            disponibiliteDates: nonDisponiblePeriodes,
        };
    }
    async getVehicleAvailability(id, dateDebut, dateFin) {
        const vehicle = await this.voitureModel.findById(id).exec();
        if (!vehicle) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        if (!vehicle.disponibilite) {
            return {
                disponible: false,
                message: "Ce véhicule n'est actuellement pas disponible à la location.",
            };
        }
        if (!dateDebut || !dateFin) {
            const reservations = await this.reservationModel.find({
                voiture_id: id,
                date_fin: { $gte: new Date() },
                statut: { $nin: ['annulee'] },
            }).sort({ date_debut: 1 }).exec();
            const periodesReservees = reservations.map(reservation => ({
                debut: reservation.date_debut,
                fin: reservation.date_fin,
            }));
            return {
                disponible: true,
                periodesReservees,
            };
        }
        const reservationsExistantes = await this.reservationModel.find({
            voiture_id: id,
            $or: [
                { date_debut: { $lte: dateFin }, date_fin: { $gte: dateDebut } },
            ],
            statut: { $nin: ['annulee'] },
        }).exec();
        const estDisponible = reservationsExistantes.length === 0;
        return {
            disponible: estDisponible,
            message: estDisponible
                ? "Le véhicule est disponible pour les dates sélectionnées."
                : "Le véhicule n'est pas disponible pour les dates sélectionnées.",
            periodesAlternatives: !estDisponible ? await this.trouverPeriodesAlternatives(id, dateDebut, dateFin) : [],
        };
    }
    async trouverPeriodesAlternatives(id, dateDebut, dateFin) {
        const reservations = await this.reservationModel.find({
            voiture_id: id,
            date_fin: { $gte: dateDebut },
            statut: { $nin: ['annulee'] },
        }).sort({ date_debut: 1 }).exec();
        if (reservations.length === 0) {
            return [];
        }
        const alternatives = [];
        const premiereReservation = reservations[0];
        if (premiereReservation.date_debut > dateDebut) {
            alternatives.push({
                debut: dateDebut,
                fin: new Date(premiereReservation.date_debut.getTime() - 24 * 60 * 60 * 1000),
            });
        }
        for (let i = 0; i < reservations.length - 1; i++) {
            const finRes1 = new Date(reservations[i].date_fin.getTime() + 24 * 60 * 60 * 1000);
            const debutRes2 = new Date(reservations[i + 1].date_debut.getTime() - 24 * 60 * 60 * 1000);
            if (finRes1 < debutRes2) {
                alternatives.push({
                    debut: finRes1,
                    fin: debutRes2,
                });
            }
        }
        const derniereReservation = reservations[reservations.length - 1];
        if (derniereReservation.date_fin < dateFin) {
            alternatives.push({
                debut: new Date(derniereReservation.date_fin.getTime() + 24 * 60 * 60 * 1000),
                fin: dateFin,
            });
        }
        return alternatives;
    }
    async getVehicleImages(id) {
        const images = await this.imageModel.find({ voiture_id: id }).exec();
        if (!images || images.length === 0) {
            throw new common_1.NotFoundException(`Aucune image trouvée pour le véhicule avec l'ID ${id}`);
        }
        const sortedImages = [...images].sort((a, b) => {
            if (a['est_principale'] && !b['est_principale'])
                return -1;
            if (!a['est_principale'] && b['est_principale'])
                return 1;
            return 0;
        });
        return sortedImages.map(img => img['chemin']);
    }
    async getActiveOffers() {
        const now = new Date();
        const offres = await this.offreModel
            .find({
            active: true,
            date_debut: { $lte: now },
            date_fin: { $gte: now },
        })
            .populate('voiture_id')
            .exec();
        if (!offres || offres.length === 0) {
            return [];
        }
        return offres.map((offre) => ({
            id: offre._id,
            titre: offre['titre'],
            description: offre['description'],
            prix_special: offre['prix_special'],
            reduction_pourcentage: offre['reduction_pourcentage'],
            date_debut: offre['date_debut'],
            date_fin: offre['date_fin'],
            voiture: {
                id: offre['voiture_id']._id,
                marque: offre['voiture_id'].marque,
                modele: offre['voiture_id'].modele,
                annee: offre['voiture_id'].annee,
                image: offre['voiture_id'].images ? offre['voiture_id'].images[0] : null,
            },
        }));
    }
    async getOfferDetails(id) {
        const offre = await this.offreModel.findById(id).populate('voiture_id').exec();
        if (!offre) {
            throw new common_1.NotFoundException(`Offre avec l'ID ${id} non trouvée`);
        }
        const images = await this.imageModel.find({ voiture_id: offre['voiture_id']._id }).exec();
        const imageUrls = images.map(img => img['chemin']);
        return {
            id: offre._id.toString(),
            titre: offre['titre'],
            description: offre['description'],
            prix_special: offre['prix_special'],
            reduction_pourcentage: offre['reduction_pourcentage'],
            date_debut: offre['date_debut'],
            date_fin: offre['date_fin'],
            active: offre['active'],
            voiture: {
                id: offre['voiture_id']._id.toString(),
                marque: offre['voiture_id'].marque,
                modele: offre['voiture_id'].modele,
                annee: offre['voiture_id'].annee,
                categorie: offre['voiture_id'].categorie,
                images: offre['voiture_id'].images || imageUrls,
            },
        };
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(voiture_schema_1.Voiture.name)),
    __param(1, (0, mongoose_1.InjectModel)(image_schema_1.Image.name)),
    __param(2, (0, mongoose_1.InjectModel)(offre_schema_1.Offre.name)),
    __param(3, (0, mongoose_1.InjectModel)(reservation_schema_1.Reservation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], PublicService);
//# sourceMappingURL=public.service.js.map