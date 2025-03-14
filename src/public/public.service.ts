// src/public/public.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Voiture } from '../schemas/voiture.schema';
import { Image } from '../schemas/image.schema';
import { Offre } from '../schemas/offre.schema';
import { Reservation } from '../schemas/reservation.schema';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';
import { VehicleDetailsDto } from './dto/vehicle-details.dto';
import { OfferDetailsDto } from './dto/offer-details.dto';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(Voiture.name) private voitureModel: Model<Voiture>,
    @InjectModel(Image.name) private imageModel: Model<Image>,
    @InjectModel(Offre.name) private offreModel: Model<Offre>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
  ) {}

  /**
   * Rechercher des véhicules avec filtres
   */
  async searchVehicles(searchDto: SearchVehiclesDto): Promise<any[]> {
    const query: any = { disponibilite: true };

    // Filtres de base
    if (searchDto.categorie) {
      query.categorie = searchDto.categorie;
    }

    if (searchDto.marque) {
      query.marque = { $regex: new RegExp(searchDto.marque, 'i') }; // Recherche insensible à la casse
    }

    // Filtres de prix
    if (searchDto.prixMin !== undefined || searchDto.prixMax !== undefined) {
      query.prix_location = {};
      if (searchDto.prixMin !== undefined) {
        query.prix_location.$gte = searchDto.prixMin;
      }
      if (searchDto.prixMax !== undefined) {
        query.prix_location.$lte = searchDto.prixMax;
      }
    }

    // Filtres d'année
    if (searchDto.anneeMin !== undefined || searchDto.anneeMax !== undefined) {
      query.annee = {};
      if (searchDto.anneeMin !== undefined) {
        query.annee.$gte = searchDto.anneeMin;
      }
      if (searchDto.anneeMax !== undefined) {
        query.annee.$lte = searchDto.anneeMax;
      }
    }

    // Obtenir tous les véhicules qui correspondent aux filtres de base
    let vehicles = await this.voitureModel.find(query).exec();

    // Si des dates sont spécifiées, filtrer par disponibilité
    if (searchDto.dateDebut && searchDto.dateFin) {
      const dateDebut = new Date(searchDto.dateDebut);
      const dateFin = new Date(searchDto.dateFin);

      // Obtenir toutes les réservations existantes qui chevauchent la période demandée
      const reservations = await this.reservationModel.find({
        voiture_id: { $in: vehicles.map(v => v._id) },
        $or: [
          { date_debut: { $lte: dateFin }, date_fin: { $gte: dateDebut } }, // Chevauchement
        ],
        statut: { $nin: ['annulee'] }, // Exclut les réservations annulées
      }).exec();

      // Filtrer les véhicules qui ont des réservations pendant la période
      const reservedVehicleIds = reservations.map(r => r.voiture_id.toString());
      vehicles = vehicles.filter(vehicle => !reservedVehicleIds.includes(vehicle._id.toString()));
    }

    // Récupérer l'image principale pour chaque véhicule
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

  /**
   * Obtenir les détails d'un véhicule
   */
  async getVehicleDetails(id: string): Promise<VehicleDetailsDto> {
    const vehicle = await this.voitureModel.findById(id).exec();
    if (!vehicle) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
    }

    // Récupérer toutes les images pour ce véhicule
    const images = await this.imageModel.find({ voiture_id: id }).exec();
    const imageUrls = images.map(img => img['chemin']);

    // Récupérer les réservations pour déterminer les périodes de disponibilité
    const reservations = await this.reservationModel.find({
      voiture_id: id,
      statut: { $nin: ['annulee'] },
    }).exec();

    // Créer un tableau des périodes de non-disponibilité
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

  /**
   * Vérifier la disponibilité d'un véhicule pour une période donnée
   */
  async getVehicleAvailability(id: string, dateDebut?: Date, dateFin?: Date): Promise<any> {
    const vehicle = await this.voitureModel.findById(id).exec();
    if (!vehicle) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
    }

    if (!vehicle.disponibilite) {
      return {
        disponible: false,
        message: "Ce véhicule n'est actuellement pas disponible à la location.",
      };
    }

    // Si aucune date n'est fournie, retourner simplement la disponibilité globale
    if (!dateDebut || !dateFin) {
      // Récupérer toutes les réservations futures pour ce véhicule
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

    // Vérifier s'il existe des réservations qui chevauchent la période demandée
    const reservationsExistantes = await this.reservationModel.find({
      voiture_id: id,
      $or: [
        { date_debut: { $lte: dateFin }, date_fin: { $gte: dateDebut } }, // Chevauchement
      ],
      statut: { $nin: ['annulee'] }, // Exclut les réservations annulées
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

  /**
   * Trouver des périodes alternatives disponibles
   */
  private async trouverPeriodesAlternatives(id: string, dateDebut: Date, dateFin: Date): Promise<any[]> {
    // Récupérer toutes les réservations futures pour ce véhicule
    const reservations = await this.reservationModel.find({
        voiture_id: id,
        date_fin: { $gte: dateDebut },
        statut: { $nin: ['annulee'] },
      }).sort({ date_debut: 1 }).exec();

    if (reservations.length === 0) {
      return [];
    }

    // Trouver des périodes disponibles avant ou après les réservations existantes
    const alternatives: { debut: Date; fin: Date }[] = [];

    // Vérifier si une période est disponible avant la première réservation
    const premiereReservation = reservations[0];
    if (premiereReservation.date_debut > dateDebut) {
      alternatives.push({
        debut: dateDebut,
        fin: new Date(premiereReservation.date_debut.getTime() - 24 * 60 * 60 * 1000), // Jour précédent
      });
    }

    // Vérifier les périodes entre les réservations
    for (let i = 0; i < reservations.length - 1; i++) {
      const finRes1 = new Date(reservations[i].date_fin.getTime() + 24 * 60 * 60 * 1000); // Jour suivant
      const debutRes2 = new Date(reservations[i + 1].date_debut.getTime() - 24 * 60 * 60 * 1000); // Jour précédent
      
      if (finRes1 < debutRes2) {
        alternatives.push({
          debut: finRes1,
          fin: debutRes2,
        });
      }
    }

    // Vérifier si une période est disponible après la dernière réservation
    const derniereReservation = reservations[reservations.length - 1];
    if (derniereReservation.date_fin < dateFin) {
      alternatives.push({
        debut: new Date(derniereReservation.date_fin.getTime() + 24 * 60 * 60 * 1000), // Jour suivant
        fin: dateFin,
      });
    }

    return alternatives;
  }

  /**
   * Obtenir les images d'un véhicule
   */
  async getVehicleImages(id: string): Promise<string[]> {
    const images = await this.imageModel.find({ voiture_id: id }).exec();
    if (!images || images.length === 0) {
      throw new NotFoundException(`Aucune image trouvée pour le véhicule avec l'ID ${id}`);
    }

    // Trier les images pour mettre l'image principale en premier
    const sortedImages = [...images].sort((a, b) => {
      if (a['est_principale'] && !b['est_principale']) return -1;
      if (!a['est_principale'] && b['est_principale']) return 1;
      return 0;
    });

    return sortedImages.map(img => img['chemin']);
  }

  /**
   * Obtenir toutes les offres actives
   */
  async getActiveOffers(): Promise<any[]> {
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

  /**
   * Obtenir les détails d'une offre
   */
  async getOfferDetails(id: string): Promise<OfferDetailsDto> {
    const offre = await this.offreModel.findById(id).populate('voiture_id').exec();
    if (!offre) {
      throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
    }

    // Récupérer les images du véhicule
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
}
