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
import { OptionSupplementaire, OptionSupplementaireDocument } from '../schemas/option-supplementaire.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { FilterReservationsDto } from './dto/filter-reservations.dto';
import { ReservationStepDto, OptionsSelectionDto } from './dto/reservation-step.dto';
import { OptionsService } from './options.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Voiture.name) private voitureModel: Model<VoitureDocument>,
    @InjectModel(Offre.name) private offreModel: Model<OffreDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(OptionSupplementaire.name)
    private optionModel: Model<OptionSupplementaireDocument>,
    private optionsService: OptionsService,
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
            // CORRECTION : utilisation de String() au lieu de toString()
            const vehicleId = String(vehicle._id);
            const offreApplicable = offre.voitures.some(
              (v) => String(v) === vehicleId
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

      // Ajouter le prix des options si spécifiées
      if (
        createReservationDto.options &&
        createReservationDto.options.length > 0
      ) {
        const prixOptions = await this.optionsService.calculerPrixOptions(
          createReservationDto.options,
        );
        prixTotal += prixOptions;
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
      options: createReservationDto.options || [],
      etape_reservation: createReservationDto.etape_reservation || 1,
      code_promo: createReservationDto.code_promo,
      acompte_paye: createReservationDto.acompte_paye || false,
      montant_acompte: createReservationDto.montant_acompte || 0,
      commentaires: createReservationDto.commentaires,
    });

    return newReservation.save();
  }

  // Méthode pour commencer un processus de réservation
  async startReservationProcess(
    userId: string,
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    // Pour la première étape, on crée simplement la réservation
    // avec l'étape_reservation définie à 1
    createReservationDto.etape_reservation = 1;
    return this.createReservation(userId, createReservationDto, false);
  }

  // Méthode pour passer à l'étape suivante
  async moveToNextStep(
    userId: string,
    stepDto: ReservationStepDto,
  ): Promise<Reservation | null> {
    const reservation = await this.reservationModel.findById(
      stepDto.reservation_id,
    );

    if (!reservation) {
      throw new NotFoundException(
        `Réservation avec l'ID ${stepDto.reservation_id} non trouvée`,
      );
    }
    console.log(reservation.utilisateur_id);
    // Vérifier que l'utilisateur est le propriétaire de la réservation
    if (reservation.utilisateur_id.toString() === userId) {
      throw new BadRequestException(
        "'Vous n'êtes pas autorisé à modifier cette réservation'",
      );
    }

    // Vérifier que la réservation est toujours en attente
    if (reservation.statut !== 'en_attente') {
      throw new BadRequestException(
        'Cette réservation ne peut pas être modifiée dans son état actuel',
      );
    }

    // Vérifier que l'étape demandée est valide (ne peut pas sauter d'étapes)
    const currentStep = reservation.etape_reservation;
    if (stepDto.etape !== currentStep + 1 && stepDto.etape !== currentStep - 1) {
      throw new BadRequestException(`Impossible de passer de l'étape ${currentStep} à l'étape ${stepDto.etape}`);
    }

    // Mettre à jour l'étape de la réservation
    return this.reservationModel
      .findByIdAndUpdate(
        stepDto.reservation_id,
        { etape_reservation: stepDto.etape },
        { new: true },
      )
      .populate('voiture_id')
      .populate('options')
      .populate('offre_id')
      .exec();
  }

  // Méthode pour ajouter des options à une réservation
  async selectOptions(
    userId: string,
    optionsDto: OptionsSelectionDto,
  ): Promise<Reservation | null> {
    const reservation = await this.reservationModel.findById(
      optionsDto.reservation_id,
    );

    if (!reservation) {
      throw new NotFoundException(
        `Réservation avec l'ID ${optionsDto.reservation_id} non trouvée`,
      );
    }

    // Vérifier que l'utilisateur est le propriétaire de la réservation
    if (reservation.utilisateur_id.toString() === userId) {
      throw new BadRequestException(
        "'Vous n'êtes pas autorisé à modifier cette réservation'",
      );
    }

    // Vérifier que la réservation est toujours en attente
    if (reservation.statut !== 'en_attente') {
      throw new BadRequestException(
        'Cette réservation ne peut pas être modifiée dans son état actuel',
      );
    }

    // Vérifier que nous sommes bien à l'étape des options (étape 2)
    if (reservation.etape_reservation !== 2) {
      throw new BadRequestException(
        "'Vous devez être à l'étape de sélection des options pour effectuer cette action'",
      );
    }

    // Vérifier que toutes les options existent et sont disponibles
    for (const optionId of optionsDto.options_ids) {
      const option = await this.optionModel.findById(optionId);
      if (!option) {
        throw new NotFoundException(`Option avec l'ID ${optionId} non trouvée`);
      }
      if (!option.disponible) {
        throw new BadRequestException(`L'option ${option.nom} n'est pas disponible actuellement`);
      }
    }

    // Calculer le prix total avec les nouvelles options
    const vehicle = await this.voitureModel.findById(reservation.voiture_id);
    if (!vehicle) {
      throw new NotFoundException(`Voiture avec l'ID ${reservation.voiture_id} non trouvée`);
    }
    const nbJours = Math.ceil(
      (reservation.date_fin.getTime() - reservation.date_debut.getTime()) / (1000 * 3600 * 24)
    );

    let prixTotal = vehicle.prix_location * nbJours;

    // Appliquer la réduction de l'offre si présente
    if (reservation.offre_id) {
      const offre = await this.offreModel.findById(reservation.offre_id);
      if (offre && offre.statut === 'active') {
        // CORRECTION : utilisation de String() au lieu de toString()
        const vehicleId = String(vehicle._id);
        const offreApplicable = offre.voitures.some(
          (v) => String(v) === vehicleId
        );
        if (offreApplicable) {
          prixTotal = prixTotal * (1 - offre.reduction / 100);
        }
      }
    }

    // Ajouter le prix des options
    const prixOptions = await this.optionsService.calculerPrixOptions(
      optionsDto.options_ids,
    );
    prixTotal += prixOptions;

    // Mettre à jour la réservation avec les options et le nouveau prix
    return this.reservationModel
      .findByIdAndUpdate(
        optionsDto.reservation_id,
        {
          options: optionsDto.options_ids,
          prix_total: prixTotal,
          etape_reservation: 3, // Passer automatiquement à l'étape de récapitulatif
        },
        { new: true },
      )
      .populate('voiture_id')
      .populate('options')
      .populate('offre_id')
      .exec();
  }
  // Obtenir le récapitulatif d'une réservation
  async getReservationSummary(userId: string, reservationId: string): Promise<any> {
    const reservation = await this.reservationModel.findById(reservationId)
      .populate('voiture_id')
      .populate('options')
      .populate('offre_id')
      .populate('utilisateur_id');

    if (!reservation) {
      throw new NotFoundException(
        `Réservation avec l'ID ${reservationId} non trouvée`,
      );
    }

    // Vérifier que l'utilisateur est le propriétaire de la réservation ou un gérant
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    if (
      reservation.utilisateur_id.toString() === userId && 
      user.role !== 'gerant'
    ) {
      throw new BadRequestException(
        "Vous n'êtes pas autorisé à consulter cette réservation",
      );
    }

    // Calculer le montant de l'acompte (30% du prix total)
    const montantAcompte = Math.round(reservation.prix_total * 0.3);

    // Préparer le récapitulatif
    return {
      reservation,
      montantAcompte,
      montantTotal: reservation.prix_total,
      nbJours: Math.ceil(
        (reservation.date_fin.getTime() - reservation.date_debut.getTime()) /
          (1000 * 3600 * 24),
      ),
    };
  }

  // Méthode pour appliquer un code promo à la réservation
  async applyPromoCode(
    userId: string,
    reservationId: string,
    codePromo: string,
  ): Promise<Reservation | null> {
    const reservation = await this.reservationModel.findById(reservationId);

    if (!reservation) {
      throw new NotFoundException(
        `Réservation avec l'ID ${reservationId} non trouvée`,
      );
    }

    // Vérifier que l'utilisateur est le propriétaire de la réservation
    if (reservation.utilisateur_id.toString() === userId) {
      throw new BadRequestException(
        "'Vous n'êtes pas autorisé à modifier cette réservation'",
      );
    }

    // Vérifier que la réservation est toujours en attente
    if (reservation.statut !== 'en_attente') {
      throw new BadRequestException(
        'Cette réservation ne peut pas être modifiée dans son état actuel',
      );
    }

    // Vérifier que nous sommes bien à l'étape du récapitulatif (étape 3) ou du paiement (étape 4)
    if (
      reservation.etape_reservation !== 3 &&
      reservation.etape_reservation !== 4
    ) {
      throw new BadRequestException(
        'Vous ne pouvez pas appliquer de code promo à cette étape',
      );
    }

    // Vérifier que le code promo existe et est valide
    // Exemple : recherche dans les offres ayant un code promo correspondant
    const offre = await this.offreModel.findOne({
      code_promo: codePromo,
      statut: 'active',
      date_debut: { $lte: new Date() },
      date_fin: { $gte: new Date() },
    });

    /* if (!offre) {
      throw new BadRequestException('Ce code promo est invalide ou expiré');
    } */

    // Recalculer le prix total avec la réduction du code promo
    // Par exemple, appliquer une réduction supplémentaire de 10%
    const reduction = 0.1; // 10% de réduction
    const nouveauPrix = reservation.prix_total * (1 - reduction);

    // Mettre à jour la réservation avec le code promo et le nouveau prix
    return this.reservationModel
      .findByIdAndUpdate(
        reservationId,
        {
          code_promo: codePromo,
          prix_total: nouveauPrix,
        },
        { new: true },
      )
      .populate('voiture_id')
      .populate('options')
      .populate('offre_id')
      .exec();
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
      .populate('options')
      .exec();
  }

  async getAllReservations(): Promise<Reservation[]> {
    return this.reservationModel
      .find()
      .populate('utilisateur_id', '-mot_de_passe')
      .populate('voiture_id')
      .populate('offre_id')
      .populate('options')
      .exec();
  }

  async getReservationById(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('utilisateur_id', '-mot_de_passe')
      .populate('voiture_id')
      .populate('offre_id')
      .populate('options')
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
      .populate('options')
      .exec();
  }

  async updateReservation(
    id: string,
    updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation | null> {
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
      updateReservationDto.offre_id ||
      updateReservationDto.options
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
      if (!vehicle) {
        throw new NotFoundException(`Voiture avec l'ID ${voitureId} non trouvée`);
      }

      const nbJours = Math.ceil(
        (dateFin.getTime() - dateDebut.getTime()) / (1000 * 3600 * 24),
      );
      let prixTotal = vehicle.prix_location * nbJours;

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
            // CORRECTION : utilisation de String() au lieu de toString()
            const vehicleId = String(vehicle._id);
            const isVehicleEligible = offre.voitures.some(v => String(v) === vehicleId);
            // Appliquer la réduction si le véhicule est éligible
            if (isVehicleEligible) {
              prixTotal = prixTotal * (1 - offre.reduction / 100);
            }
            // Vérifier le code promo
            if (updateReservationDto.code_promo && offre.code_promo === updateReservationDto.code_promo) {
              prixTotal = prixTotal * 0.9; // Réduction supplémentaire de 10%
            }
          }
        }
      }

      // Ajouter le prix des options
      if (updateReservationDto.options && updateReservationDto.options.length > 0) {
        const prixOptions = await this.optionsService.calculerPrixOptions(updateReservationDto.options);
        prixTotal += prixOptions;
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
      .populate('options')
      .exec();

    return updatedReservation;
  }

  async changeReservationStatus(
    id: string,
    statut: string,
  ): Promise<Reservation | null> {
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
      .populate('options')
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
