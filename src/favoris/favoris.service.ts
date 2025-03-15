// src/favoris/favoris.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FavoriVoiture } from '../schemas/favori.schema';
import { FavoriOffre } from '../schemas/favori.schema';
import { Notification } from '../schemas/notification.schema';
import { Voiture } from '../schemas/voiture.schema';
import { Offre } from '../schemas/offre.schema';

@Injectable()
export class FavorisService {
  constructor(
    @InjectModel(FavoriVoiture.name)
    private favoriVoitureModel: Model<FavoriVoiture>,
    @InjectModel(FavoriOffre.name) private favoriOffreModel: Model<FavoriOffre>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(Voiture.name) private voitureModel: Model<Voiture>,
    @InjectModel(Offre.name) private offreModel: Model<Offre>,
  ) {}

  /**
   * Obtenir les véhicules favoris d'un utilisateur
   */
  async getFavorisVoitures(
    userId: string,
    populateDetails: boolean = false,
  ): Promise<any[]> {
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
    } else {
      return favoris.map((favori) => ({
        id: favori._id,
        date_ajout: favori.date_ajout,
        voiture_id: favori.voiture_id,
      }));
    }
  }

  /**
   * Ajouter un véhicule aux favoris
   */
  async addFavoriVoiture(userId: string, voitureId: string): Promise<any> {
    // Vérifier si le véhicule existe
    const voiture = await this.voitureModel.findById(voitureId).exec();
    if (!voiture) {
      throw new NotFoundException(`Véhicule avec l'ID ${voitureId} non trouvé`);
    }

    // Log pour déboguer
    console.log('UserId:', userId);
    console.log('VoitureId:', voitureId);

    // Vérifier si le véhicule est déjà en favori
    const existingFavori = await this.favoriVoitureModel
      .findOne({
        utilisateur_id: userId,
        voiture_id: voitureId,
      })
      .exec();

    if (existingFavori) {
      throw new ConflictException('Ce véhicule est déjà dans vos favoris');
    }

    // Créer le favori avec conversion explicite en ObjectId si nécessaire
    const newFavori = new this.favoriVoitureModel({
      utilisateur_id: new Types.ObjectId(userId),
      voiture_id: new Types.ObjectId(voitureId),
      date_ajout: new Date(),
    });

    await newFavori.save();

    return {
      id: newFavori._id,
      date_ajout: newFavori.date_ajout,
      voiture_id: voitureId,
    };
  }

  /**
   * Supprimer un véhicule des favoris
   */
  async removeFavoriVoiture(userId: string, voitureId: string): Promise<any> {
    const result = await this.favoriVoitureModel
      .findOneAndDelete({
        utilisateur_id: userId,
        voiture_id: voitureId,
      })
      .exec();

    if (!result) {
      throw new NotFoundException(`Véhicule non trouvé dans vos favoris`);
    }

    return { message: 'Véhicule retiré des favoris avec succès' };
  }

  /**
   * Vérifier si un véhicule est dans les favoris
   */
  async checkVoitureFavori(userId: string, voitureId: string): Promise<any> {
    const favori = await this.favoriVoitureModel
      .findOne({
        utilisateur_id: userId,
        voiture_id: voitureId,
      })
      .exec();

    return { isFavorite: !!favori };
  }

  /**
   * Obtenir les offres favorites d'un utilisateur
   */
  async getFavorisOffres(
    userId: string,
    populateDetails: boolean = false,
  ): Promise<any[]> {
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
    } else {
      return favoris.map((favori) => ({
        id: favori._id,
        date_ajout: favori.date_ajout,
        offre_id: favori.offre_id,
      }));
    }
  }

  /**
   * Ajouter une offre aux favoris
   */
  async addFavoriOffre(userId: string, offreId: string): Promise<any> {
    // Vérifier si l'offre existe
    const offre = await this.offreModel.findById(offreId).exec();
    if (!offre) {
      throw new NotFoundException(`Offre avec l'ID ${offreId} non trouvée`);
    }

    // Vérifier si l'offre est déjà en favori
    const existingFavori = await this.favoriOffreModel
      .findOne({
        utilisateur_id: userId,
        offre_id: offreId,
      })
      .exec();

    if (existingFavori) {
      throw new ConflictException('Cette offre est déjà dans vos favoris');
    }

    // Créer le favori
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

  /**
   * Supprimer une offre des favoris
   */
  async removeFavoriOffre(userId: string, offreId: string): Promise<any> {
    const result = await this.favoriOffreModel
      .findOneAndDelete({
        utilisateur_id: userId,
        offre_id: offreId,
      })
      .exec();

    if (!result) {
      throw new NotFoundException(`Offre non trouvée dans vos favoris`);
    }

    return { message: 'Offre retirée des favoris avec succès' };
  }

  /**
   * Vérifier si une offre est dans les favoris
   */
  async checkOffreFavori(userId: string, offreId: string): Promise<any> {
    const favori = await this.favoriOffreModel
      .findOne({
        utilisateur_id: userId,
        offre_id: offreId,
      })
      .exec();

    return { isFavorite: !!favori };
  }

  /**
   * Obtenir les notifications d'un utilisateur
   */
  async getNotifications(_id: string): Promise<any[]> {
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

  /**
   * Marquer une notification comme lue
   */
  async marquerNotificationLue(
    userId: string,
    notificationId: string,
  ): Promise<any> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        {
          _id: notificationId,
          utilisateur_id: userId,
        },
        { lue: true },
        { new: true },
      )
      .exec();

    if (!notification) {
      throw new NotFoundException(`Notification non trouvée`);
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

  /**
   * Marquer toutes les notifications comme lues
   */
  async marquerToutesNotificationsLues(userId: string): Promise<any> {
    await this.notificationModel
      .updateMany({ utilisateur_id: userId }, { lue: true })
      .exec();

    return { message: 'Toutes les notifications ont été marquées comme lues' };
  }

  /**
   * Supprimer une notification
   */
  async supprimerNotification(
    userId: string,
    notificationId: string,
  ): Promise<any> {
    const result = await this.notificationModel
      .findOneAndDelete({
        _id: notificationId,
        utilisateur_id: userId,
      })
      .exec();

    if (!result) {
      throw new NotFoundException(`Notification non trouvée`);
    }

    return { message: 'Notification supprimée avec succès' };
  }

  /**
   * Supprimer toutes les notifications
   */
  async supprimerToutesNotifications(userId: string): Promise<any> {
    await this.notificationModel.deleteMany({ utilisateur_id: userId }).exec();
    return { message: 'Toutes les notifications ont été supprimées' };
  }

  /**
   * Créer une notification pour changement de disponibilité d'un véhicule
   * Cette méthode sera appelée lorsqu'un véhicule favori change de disponibilité
   */
  async notifierChangementDisponibilite(
    voitureId: string,
    estDisponible: boolean,
  ): Promise<void> {
    // Trouver tous les utilisateurs qui ont ce véhicule en favori
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

    // Créer une notification pour chaque utilisateur
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

  /**
   * Créer une notification pour changement de prix d'un véhicule
   * Cette méthode sera appelée lorsqu'un véhicule favori change de prix
   */
  async notifierChangementPrix(voitureId: string, ancienPrix: number, nouveauPrix: number): Promise<void> {
    // Trouver tous les utilisateurs qui ont ce véhicule en favori
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

    // Créer une notification pour chaque utilisateur
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

  /**
   * Créer une notification pour nouvelle offre
   * Cette méthode sera appelée lorsqu'une nouvelle offre est créée pour un véhicule favori
   */
  async notifierNouvelleOffre(offreId: string): Promise<void> {
    const offre = await this.offreModel.findById(offreId).populate('voitures').exec();
    if (!offre) {
      return;
    }

    // Pour chaque véhicule concerné par l'offre
    for (const voiture of offre.voitures) {
      // Trouver tous les utilisateurs qui ont ce véhicule en favori
      const voitureId = (voiture as any)._id;
      const favoris = await this.favoriVoitureModel
        .find({ voiture_id: voitureId })
        .exec();
      if (favoris.length === 0) {
        continue;
      }

      const titre = "Nouvelle offre spéciale !";
      const message = `Nouvelle offre "${offre.titre}" disponible pour le véhicule ${voiture.marque} ${voiture.modele}.`;

      // Créer une notification pour chaque utilisateur
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
}
