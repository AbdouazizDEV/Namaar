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
exports.FavorisService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const favori_schema_1 = require("../schemas/favori.schema");
const favori_schema_2 = require("../schemas/favori.schema");
const notification_schema_1 = require("../schemas/notification.schema");
const voiture_schema_1 = require("../schemas/voiture.schema");
const offre_schema_1 = require("../schemas/offre.schema");
let FavorisService = class FavorisService {
    constructor(favoriVoitureModel, favoriOffreModel, notificationModel, voitureModel, offreModel) {
        this.favoriVoitureModel = favoriVoitureModel;
        this.favoriOffreModel = favoriOffreModel;
        this.notificationModel = notificationModel;
        this.voitureModel = voitureModel;
        this.offreModel = offreModel;
    }
    async getFavorisVoitures(userId, populateDetails = false) {
        const query = this.favoriVoitureModel.find({ utilisateur_id: userId });
        if (populateDetails) {
            query.populate('voiture_id');
        }
        const favoris = await query.exec();
        if (populateDetails) {
            return favoris.map((favori) => ({
                id: favori._id,
                date_ajout: favori.date_ajout,
                voiture: favori.voiture_id,
            }));
        }
        else {
            return favoris.map((favori) => ({
                id: favori._id,
                date_ajout: favori.date_ajout,
                voiture_id: favori.voiture_id,
            }));
        }
    }
    async addFavoriVoiture(userId, voitureId) {
        const voiture = await this.voitureModel.findById(voitureId).exec();
        if (!voiture) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${voitureId} non trouvé`);
        }
        console.log('UserId:', userId);
        console.log('VoitureId:', voitureId);
        const existingFavori = await this.favoriVoitureModel
            .findOne({
            utilisateur_id: userId,
            voiture_id: voitureId,
        })
            .exec();
        if (existingFavori) {
            throw new common_1.ConflictException('Ce véhicule est déjà dans vos favoris');
        }
        const newFavori = new this.favoriVoitureModel({
            utilisateur_id: new mongoose_2.Types.ObjectId(userId),
            voiture_id: new mongoose_2.Types.ObjectId(voitureId),
            date_ajout: new Date(),
        });
        await newFavori.save();
        return {
            id: newFavori._id,
            date_ajout: newFavori.date_ajout,
            voiture_id: voitureId,
        };
    }
    async removeFavoriVoiture(userId, voitureId) {
        const result = await this.favoriVoitureModel
            .findOneAndDelete({
            utilisateur_id: userId,
            voiture_id: voitureId,
        })
            .exec();
        if (!result) {
            throw new common_1.NotFoundException(`Véhicule non trouvé dans vos favoris`);
        }
        return { message: 'Véhicule retiré des favoris avec succès' };
    }
    async checkVoitureFavori(userId, voitureId) {
        const favori = await this.favoriVoitureModel
            .findOne({
            utilisateur_id: userId,
            voiture_id: voitureId,
        })
            .exec();
        return { isFavorite: !!favori };
    }
    async getFavorisOffres(userId, populateDetails = false) {
        const query = this.favoriOffreModel.find({ utilisateur_id: userId });
        if (populateDetails) {
            query.populate('offre_id');
        }
        const favoris = await query.exec();
        if (populateDetails) {
            return favoris.map((favori) => ({
                id: favori._id,
                date_ajout: favori.date_ajout,
                offre: favori.offre_id,
            }));
        }
        else {
            return favoris.map((favori) => ({
                id: favori._id,
                date_ajout: favori.date_ajout,
                offre_id: favori.offre_id,
            }));
        }
    }
    async addFavoriOffre(userId, offreId) {
        const offre = await this.offreModel.findById(offreId).exec();
        if (!offre) {
            throw new common_1.NotFoundException(`Offre avec l'ID ${offreId} non trouvée`);
        }
        const existingFavori = await this.favoriOffreModel
            .findOne({
            utilisateur_id: userId,
            offre_id: offreId,
        })
            .exec();
        if (existingFavori) {
            throw new common_1.ConflictException('Cette offre est déjà dans vos favoris');
        }
        const newFavori = new this.favoriOffreModel({
            utilisateur_id: userId,
            offre_id: offreId,
            date_ajout: new Date(),
        });
        await newFavori.save();
        return {
            id: newFavori._id,
            date_ajout: newFavori.date_ajout,
            offre_id: offreId,
        };
    }
    async removeFavoriOffre(userId, offreId) {
        const result = await this.favoriOffreModel
            .findOneAndDelete({
            utilisateur_id: userId,
            offre_id: offreId,
        })
            .exec();
        if (!result) {
            throw new common_1.NotFoundException(`Offre non trouvée dans vos favoris`);
        }
        return { message: 'Offre retirée des favoris avec succès' };
    }
    async checkOffreFavori(userId, offreId) {
        const favori = await this.favoriOffreModel
            .findOne({
            utilisateur_id: userId,
            offre_id: offreId,
        })
            .exec();
        return { isFavorite: !!favori };
    }
    async getNotifications(_id) {
        const notifications = await this.notificationModel
            .find({
            utilisateur_id: _id,
        })
            .sort({ date: -1 })
            .exec();
        return notifications.map((notification) => ({
            id: notification._id,
            type: notification.type,
            titre: notification.titre,
            message: notification.message,
            date: notification.date,
            lue: notification.lue,
            entite_id: notification.entite_id,
            entite_type: notification.entite_type,
        }));
    }
    async marquerNotificationLue(userId, notificationId) {
        const notification = await this.notificationModel
            .findOneAndUpdate({
            _id: notificationId,
            utilisateur_id: userId,
        }, { lue: true }, { new: true })
            .exec();
        if (!notification) {
            throw new common_1.NotFoundException(`Notification non trouvée`);
        }
        return {
            id: notification._id,
            type: notification.type,
            titre: notification.titre,
            message: notification.message,
            date: notification.date,
            lue: notification.lue,
            entite_id: notification.entite_id?.toString(),
            entite_type: notification.entite_type,
        };
    }
    async marquerToutesNotificationsLues(userId) {
        await this.notificationModel
            .updateMany({ utilisateur_id: userId }, { lue: true })
            .exec();
        return { message: 'Toutes les notifications ont été marquées comme lues' };
    }
    async supprimerNotification(userId, notificationId) {
        const result = await this.notificationModel
            .findOneAndDelete({
            _id: notificationId,
            utilisateur_id: userId,
        })
            .exec();
        if (!result) {
            throw new common_1.NotFoundException(`Notification non trouvée`);
        }
        return { message: 'Notification supprimée avec succès' };
    }
    async supprimerToutesNotifications(userId) {
        await this.notificationModel.deleteMany({ utilisateur_id: userId }).exec();
        return { message: 'Toutes les notifications ont été supprimées' };
    }
    async notifierChangementDisponibilite(voitureId, estDisponible) {
        const favoris = await this.favoriVoitureModel
            .find({ voiture_id: voitureId })
            .exec();
        const voiture = await this.voitureModel.findById(voitureId).exec();
        if (!voiture || favoris.length === 0) {
            return;
        }
        const titre = estDisponible
            ? '"Véhicule favori disponible !"'
            : '"Véhicule favori indisponible"';
        const message = estDisponible
            ? `Le véhicule ${voiture.marque} ${voiture.modele} est maintenant disponible à la location.`
            : `Le véhicule ${voiture.marque} ${voiture.modele} n'est plus disponible à la location.`;
        const notifications = favoris.map((favori) => ({
            utilisateur_id: favori.utilisateur_id,
            type: 'disponibilite',
            titre,
            message,
            lue: false,
            entite_id: voitureId,
            entite_type: 'voiture',
            date: new Date(),
        }));
        await this.notificationModel.insertMany(notifications);
    }
    async notifierChangementPrix(voitureId, ancienPrix, nouveauPrix) {
        const favoris = await this.favoriVoitureModel.find({ voiture_id: voitureId }).exec();
        const voiture = await this.voitureModel.findById(voitureId).exec();
        if (!voiture || favoris.length === 0) {
            return;
        }
        const titre = nouveauPrix < ancienPrix
            ? "Baisse de prix !"
            : "Changement de prix";
        const message = nouveauPrix < ancienPrix
            ? `Le prix de location du véhicule ${voiture.marque} ${voiture.modele} a baissé de ${ancienPrix} à ${nouveauPrix} FCFA.`
            : `Le prix de location du véhicule ${voiture.marque} ${voiture.modele} a changé de ${ancienPrix} à ${nouveauPrix} FCFA.`;
        const notifications = favoris.map(favori => ({
            utilisateur_id: favori.utilisateur_id,
            type: 'prix',
            titre,
            message,
            lue: false,
            entite_id: voitureId,
            entite_type: 'voiture',
            date: new Date(),
        }));
        await this.notificationModel.insertMany(notifications);
    }
    async notifierNouvelleOffre(offreId) {
        const offre = await this.offreModel.findById(offreId).populate('voitures').exec();
        if (!offre) {
            return;
        }
        for (const voiture of offre.voitures) {
            const voitureId = voiture._id;
            const favoris = await this.favoriVoitureModel
                .find({ voiture_id: voitureId })
                .exec();
            if (favoris.length === 0) {
                continue;
            }
            const titre = "Nouvelle offre spéciale !";
            const message = `Nouvelle offre "${offre.titre}" disponible pour le véhicule ${voiture.marque} ${voiture.modele}.`;
            const notifications = favoris.map(favori => ({
                utilisateur_id: favori.utilisateur_id,
                type: 'offre',
                titre,
                message,
                lue: false,
                entite_id: offre._id,
                entite_type: 'offre',
                date: new Date(),
            }));
            await this.notificationModel.insertMany(notifications);
        }
    }
};
exports.FavorisService = FavorisService;
exports.FavorisService = FavorisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(favori_schema_1.FavoriVoiture.name)),
    __param(1, (0, mongoose_1.InjectModel)(favori_schema_2.FavoriOffre.name)),
    __param(2, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(3, (0, mongoose_1.InjectModel)(voiture_schema_1.Voiture.name)),
    __param(4, (0, mongoose_1.InjectModel)(offre_schema_1.Offre.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], FavorisService);
//# sourceMappingURL=favoris.service.js.map