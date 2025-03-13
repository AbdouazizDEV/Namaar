// src/reservations/reservations.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Reservation,
  ReservationDocument,
} from '../schemas/reservation.schema';
import { Voiture, VoitureDocument } from '../schemas/voiture.schema';
import { Offre, OffreDocument } from '../schemas/offre.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { FilterReservationsDto } from './dto/filter-reservations.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Voiture.name) private voitureModel: Model<VoitureDocument>,
    @InjectModel(Offre.name) private offreModel: Model<OffreDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createReservation(
    userId: string,
    createReservationDto: CreateReservationDto,
    isManager = false,
  ): Promise<Reservation> {
    let clientId = userId;
    if (isManager && createReservationDto.utilisateur_id) {
      const client = await this.userModel.findById(
        createReservationDto.utilisateur_id,
      );
      if (!client) {
        throw new NotFoundException(
          `Client avec l'ID ${createReservationDto.utilisateur_id} non trouvé`,
        );
      }
      clientId = createReservationDto.utilisateur_id;
    }
    // Vérifier que l'utilisateur existe
    const user = await this.userModel.findById(clientId);
    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${clientId} non trouvé`,
      );
    }

    // Vérifier que la voiture existe
    const vehicle = await this.voitureModel.findById(
      createReservationDto.voiture_id,
    );
    if (!vehicle) {
      throw new NotFoundException(
        `Voiture avec l'ID ${createReservationDto.voiture_id} non trouvée`,
      );
    }

    // Vérifier que la voiture est disponible
    if (!vehicle.disponibilite) {
      throw new BadRequestException(
        "Cette voiture n'est pas disponible à la location",
      );
    }

    // Vérifier que les dates sont valides
    const dateDebut = new Date(createReservationDto.date_debut);
    const dateFin = new Date(createReservationDto.date_fin);
    const now = new Date();

    if (dateDebut < now) {
      throw new BadRequestException('La date de début doit être dans le futur');
    }

    if (dateFin <= dateDebut) {
      throw new BadRequestException(
        'La date de fin doit être postérieure à la date de début',
      );
    }

    // Vérifier qu'il n'y a pas de chevauchement avec d'autres réservations
    const reservationsExistantes = await this.reservationModel.find({
      voiture_id: createReservationDto.voiture_id,
      statut: { $in: ['en_attente', 'confirmee'] },
      $or: [
        // Chevauchement : début pendant une autre réservation
        {
          date_debut: { $lte: dateFin },
          date_fin: { $gte: dateDebut },
        },
      ],
    });

    if (reservationsExistantes.length > 0) {
      throw new ConflictException(
        'Cette voiture est déjà réservée pour cette période',
      );
    }

    // Calculer le prix total si nécessaire
    let prixTotal = createReservationDto.prix_total;
    if (!prixTotal) {
      const nbJours = Math.ceil(
        (dateFin.getTime() - dateDebut.getTime()) / (1000 * 3600 * 24),
      );
      prixTotal = vehicle.prix_location * nbJours;

      // Appliquer la réduction si une offre est spécifiée
      if (createReservationDto.offre_id) {
        const offre = await this.offreModel.findById(
          createReservationDto.offre_id,
        );
        if (offre) {
          const dateActuelle = new Date();
          if (
            offre.statut === 'active' &&
            dateActuelle >= new Date(offre.date_debut) &&
            dateActuelle <= new Date(offre.date_fin)
          ) {
            // Vérifier si l'offre s'applique à cette voiture
            const offreApplicable = offre.voitures.some(
              (v) => (v as any).toString() === vehicle.id.toString(),
            );
            if (offreApplicable) {
              prixTotal = prixTotal * (1 - offre.reduction / 100);
            } else {
              throw new BadRequestException(
                "Cette offre ne s'applique pas à cette voiture",
              );
            }
          } else {
            throw new BadRequestException(
              "Cette offre n'est pas active actuellement",
            );
          }
        } else {
          throw new NotFoundException(
            `Offre avec l'ID ${createReservationDto.offre_id} non trouvée`,
          );
        }
      }
    }

    // Créer la réservation
    const newReservation = new this.reservationModel({
      utilisateur_id: clientId, // Utiliser l'ID du client
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

  async getClientReservations(clientId: string): Promise<Reservation[]> {
    const client = await this.userModel.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client avec l'ID ${clientId} non trouvé`);
    }

    return this.reservationModel
      .find({ utilisateur_id: clientId })
      .populate('utilisateur_id', '-mot_de_passe')
      .populate('voiture_id')
      .populate('offre_id')
      .exec();
  }
  async getAllReservations(): Promise<Reservation[]> {
    return this.reservationModel
      .find()
      .populate('utilisateur_id', '-mot_de_passe')
      .populate('voiture_id')
      .populate('offre_id')
      .exec();
  }

  async getReservationById(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('utilisateur_id', '-mot_de_passe')
      .populate('voiture_id')
      .populate('offre_id')
      .exec();

    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }

    return reservation;
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    return this.reservationModel
      .find({ utilisateur_id: userId })
      .populate('voiture_id')
      .populate('offre_id')
      .exec();
  }

  async updateReservation(
    id: string,
    updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }

    // Validation des dates si elles sont modifiées
    if (updateReservationDto.date_debut || updateReservationDto.date_fin) {
      const dateDebut = updateReservationDto.date_debut
        ? new Date(updateReservationDto.date_debut)
        : reservation.date_debut;

      const dateFin = updateReservationDto.date_fin
        ? new Date(updateReservationDto.date_fin)
        : reservation.date_fin;

      if (dateFin <= dateDebut) {
        throw new BadRequestException(
          'La date de fin doit être postérieure à la date de début',
        );
      }

      // Vérifier chevauchement uniquement si les dates changent
      if (updateReservationDto.date_debut || updateReservationDto.date_fin) {
        const voitureId =
          updateReservationDto.voiture_id || reservation.voiture_id.toString();

        const reservationsExistantes = await this.reservationModel.find({
          _id: { $ne: id }, // Exclure la réservation actuelle
          voiture_id: voitureId,
          statut: { $in: ['en_attente', 'confirmee'] },
          date_debut: { $lte: dateFin },
          date_fin: { $gte: dateDebut },
        });

        if (reservationsExistantes.length > 0) {
          throw new ConflictException(
            'Cette voiture est déjà réservée pour cette période',
          );
        }
      }
    }

    // Recalculer le prix si nécessaire
    if (
      updateReservationDto.voiture_id ||
      updateReservationDto.date_debut ||
      updateReservationDto.date_fin ||
      updateReservationDto.offre_id
    ) {
      const voitureId =
        updateReservationDto.voiture_id || reservation.voiture_id;
      const dateDebut = updateReservationDto.date_debut
        ? new Date(updateReservationDto.date_debut)
        : reservation.date_debut;

      const dateFin = updateReservationDto.date_fin
        ? new Date(updateReservationDto.date_fin)
        : reservation.date_fin;

      const vehicle = await this.voitureModel.findById(voitureId);

      const nbJours = Math.ceil(
        (dateFin.getTime() - dateDebut.getTime()) / (1000 * 3600 * 24),
      );
      let prixTotal = vehicle!.prix_location * nbJours;

      const offreId = updateReservationDto.offre_id || reservation.offre_id;
      if (offreId) {
        const offre = await this.offreModel.findById(offreId);
        if (offre) {
          const dateActuelle = new Date();
          if (
            offre.statut === 'active' &&
            dateActuelle >= new Date(offre.date_debut) &&
            dateActuelle <= new Date(offre.date_fin)
          ) {
            // Vérifier si l'offre s'applique à cette voiture
            if (vehicle) {
              // Vérifier si l'offre s'applique à cette voiture
              const isVehicleEligible = (vehicle._id as Object) && offre.voitures.some(v => v.toString() === (vehicle._id as Object).toString());
              // Appliquer la réduction si le véhicule est éligible
              if (isVehicleEligible) {
                prixTotal = prixTotal * (1 - offre.reduction / 100);
              }
              // Vérifier le code promo (assurez-vous d'ajouter code_promo au UpdateReservationDto)
              if (updateReservationDto.code_promo && offre.code_promo === updateReservationDto.code_promo) {
                prixTotal = prixTotal * 0.9; // Réduction supplémentaire de 10%
              }
            } else {
            throw new NotFoundException(`Voiture avec l'ID ${voitureId} non trouvée`);
            }
          }
        }
      }

      updateReservationDto.prix_total = prixTotal;
    }

    // Si le statut change à "confirmee", mettre à jour la disponibilité de la voiture
    if (
      updateReservationDto.statut === 'confirmee' &&
      reservation.statut !== 'confirmee'
    ) {
      const voitureId =
        updateReservationDto.voiture_id || reservation.voiture_id;
      await this.voitureModel.findByIdAndUpdate(voitureId, {
        disponibilite: false,
      });
    }

    // Si le statut change à "terminee" ou "annulee", remettre la voiture comme disponible
    if (
      (updateReservationDto.statut === 'terminee' ||
        updateReservationDto.statut === 'annulee') &&
      reservation.statut === 'confirmee'
    ) {
      const voitureId =
        updateReservationDto.voiture_id || reservation.voiture_id;
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
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }
    return updatedReservation;
  }

  async changeReservationStatus(
    id: string,
    statut: string,
  ): Promise<Reservation> {
    return this.updateReservation(id, { statut });
  }

  async filterReservations(
    filterDto: FilterReservationsDto,
  ): Promise<Reservation[]> {
    const query: any = {};

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

  async deleteReservation(id: string): Promise<{ message: string }> {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }

    // Si la réservation était confirmée, remettre la voiture comme disponible
    if (reservation.statut === 'confirmee') {
      await this.voitureModel.findByIdAndUpdate(reservation.voiture_id, {
        disponibilite: true,
      });
    }

    await this.reservationModel.findByIdAndDelete(id);
    return { message: 'Réservation supprimée avec succès' };
  }
}
