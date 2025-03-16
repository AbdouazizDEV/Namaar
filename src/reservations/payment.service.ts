// src/reservations/payment.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../schemas/transaction.schema';
import { Reservation, ReservationDocument } from '../schemas/reservation.schema';
import { Paiement, PaiementDocument } from '../schemas/paiement.schema';
import { Facture, FactureDocument } from '../schemas/facture.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { PaymentDto } from './dto/reservation-step.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Paiement.name)
    private paiementModel: Model<PaiementDocument>,
    @InjectModel(Facture.name)
    private factureModel: Model<FactureDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async processPayment(userId: string, paymentDto: PaymentDto): Promise<Transaction> {
    const reservation = await this.reservationModel.findById(paymentDto.reservation_id)
      .populate('voiture_id')
      .populate('utilisateur_id');
    
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${paymentDto.reservation_id} non trouvée`);
    }

    // Vérifier que l'utilisateur est le propriétaire de la réservation
    if (reservation.utilisateur_id.toString() === userId) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à payer cette réservation');
    }

    // Vérifier que la réservation est en attente
    if (reservation.statut !== 'en_attente') {
      throw new BadRequestException('Cette réservation ne peut pas être payée dans son état actuel');
    }

    // Vérifier que nous sommes à l'étape du paiement (étape 4)
    if (reservation.etape_reservation !== 4) {
      // Mais autoriser un paiement même si l'utilisateur n'est pas à l'étape 4 (pour flexibilité)
      await this.reservationModel.findByIdAndUpdate(
        paymentDto.reservation_id,
        { etape_reservation: 4 }
      );
    }

    // Calculer le montant à payer (acompte ou totalité)
    const montantTotal = reservation.prix_total;
    const montantAcompte = Math.round(montantTotal * 0.3); // 30% d'acompte
    const montantAPayer = paymentDto.payer_acompte ? montantAcompte : montantTotal;
    
    // Simuler une transaction avec un service de paiement externe
    // Dans un environnement réel, vous intégreriez ici un service comme Stripe, PayPal, etc.
    const paiementReussi = await this.simulerPaiement(paymentDto.token_paiement || 'default_token', montantAPayer);
    
    if (!paiementReussi) {
      throw new BadRequestException('Le paiement a échoué. Veuillez réessayer avec une autre méthode de paiement.');
    }
    
    // Créer une facture
    const facture = new this.factureModel({
      client_id: userId,
      reservation_id: paymentDto.reservation_id,
      date_emission: new Date(),
      date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)),
      montant_total: montantTotal,
      notes: paymentDto.payer_acompte ? 'Acompte payé' : 'Paiement intégral',
      statut: paymentDto.payer_acompte ? 'en_attente' : 'payée',
    });
    
    const savedFacture = await facture.save();
    
    // Créer un enregistrement de paiement
    const paiement = new this.paiementModel({
      facture_id: savedFacture._id,
      reservation_id: paymentDto.reservation_id,
      montant: montantAPayer,
      methode: paymentDto.methode_paiement,
      reference: this.generatePaymentReference(),
      date_paiement: new Date(),
      statut: 'validé',
    });
    
    await paiement.save();
    
    // Créer un enregistrement de transaction
    const transaction = new this.transactionModel({
      reservation_id: paymentDto.reservation_id,
      montant: montantAPayer,
      methode: paymentDto.methode_paiement,
      date_transaction: new Date(),
      statut: 'completee',
      reference_paiement: paiement.reference,
      est_acompte: paymentDto.payer_acompte,
      details: {
        facture_id: savedFacture._id,
        paiement_id: paiement._id,
      },
    });
    
    const savedTransaction = await transaction.save();
    
    // Mettre à jour la réservation
    const nouveauStatut = paymentDto.payer_acompte ? 'en_attente' : 'confirmee';
    
    await this.reservationModel.findByIdAndUpdate(
      paymentDto.reservation_id,
      {
        acompte_paye: paymentDto.payer_acompte,
        montant_acompte: paymentDto.payer_acompte ? montantAcompte : 0,
        etape_reservation: 5, // Étape de confirmation
        statut: nouveauStatut,
      }
    );
    
    // Si la réservation est confirmée (paiement total), mettre à jour la disponibilité du véhicule
    if (nouveauStatut === 'confirmee') {
      const voitureId = reservation.voiture_id;
      // Nous ne rendons pas le véhicule indisponible immédiatement, seulement à la date de début de la réservation
    }
    
    return savedTransaction;
  }
  
  async getPaymentMethods(): Promise<string[]> {
    // Dans un environnement réel, ces méthodes pourraient être configurées dans la base de données
    return ['carte_credit', 'paypal', 'virement_bancaire', 'especes'];
  }

  async payRemainingAmount(userId: string, reservationId: string, paymentMethod: string, token?: string): Promise<Transaction> {
    const reservation = await this.reservationModel.findById(reservationId);

    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${reservationId} non trouvée`);
    }

    if (reservation.utilisateur_id.toString() === userId) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à payer cette réservation');
    }

    // Vérifier que la réservation a un acompte déjà payé
    if (!reservation.acompte_paye) {
      throw new BadRequestException(
        "'Aucun acompte n'a été payé pour cette réservation  s,,'",
      );
    }

    // Vérifier que le reste n'a pas déjà été payé
    if (reservation.statut === 'confirmee') {
      throw new BadRequestException('Cette réservation a déjà été entièrement payée');
    }
    
    // Calculer le montant restant à payer
    const montantTotal = reservation.prix_total;
    const montantAcompte = reservation.montant_acompte;
    const montantRestant = montantTotal - montantAcompte;
    
    // Simuler une transaction avec un service de paiement externe
    const paiementReussi = await this.simulerPaiement(token || 'default_token', montantRestant);
    
    if (!paiementReussi) {
      throw new BadRequestException('Le paiement a échoué. Veuillez réessayer avec une autre méthode de paiement.');
    }
    
    // Trouver la facture existante
    const facture = await this.factureModel.findOne({ reservation_id: reservationId });
    
    if (!facture) {
      throw new NotFoundException('Facture non trouvée pour cette réservation');
    }
    
    // Mettre à jour le statut de la facture
    await this.factureModel.findByIdAndUpdate(
      facture._id,
      {
        notes: facture.notes + ' - Paiement final effectué',
        statut: 'payée',
      }
    );
    
    // Créer un enregistrement de paiement pour le reste
    const paiement = new this.paiementModel({
      facture_id: facture._id,
      reservation_id: reservationId,
      montant: montantRestant,
      methode: paymentMethod,
      reference: this.generatePaymentReference(),
      date_paiement: new Date(),
      statut: 'validé',
    });
    
    await paiement.save();
    
    // Créer un enregistrement de transaction
    const transaction = new this.transactionModel({
      reservation_id: reservationId,
      montant: montantRestant,
      methode: paymentMethod,
      date_transaction: new Date(),
      statut: 'completee',
      reference_paiement: paiement.reference,
      est_acompte: false,
      details: {
        facture_id: facture._id,
        paiement_id: paiement._id,
      },
    });
    
    const savedTransaction = await transaction.save();
    
    // Mettre à jour la réservation
    await this.reservationModel.findByIdAndUpdate(
      reservationId,
      {
        acompte_paye: false, // Plus d'acompte puisque tout est payé
        statut: 'confirmee',
      }
    );
    
    return savedTransaction;
  }
  
  private async simulerPaiement(token: string, montant: number): Promise<boolean> {
    // Simulation d'un paiement réussi
    // Dans un environnement réel, vous appelleriez un service de paiement externe ici
    
    // Pour simuler un échec aléatoire (à des fins de test)
    const randomSuccess = Math.random() > 0.1; // 10% de chance d'échec
    
    // On peut simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return randomSuccess;
  }
  
  private generatePaymentReference(): string {
    // Générer une référence de paiement unique
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `PAY-${timestamp}-${random}`;
  }
  
  // Méthode pour récupérer les paiements d'une réservation
  async getReservationPayments(reservationId: string): Promise<Paiement[]> {
    return this.paiementModel.find({ reservation_id: reservationId }).exec();
  }
  
  // Méthode pour récupérer la facture d'une réservation
  async getReservationInvoice(reservationId: string): Promise<Facture> {
    const facture = await this.factureModel.findOne({ reservation_id: reservationId }).exec();
    
    if (!facture) {
      throw new NotFoundException(`Facture non trouvée pour la réservation avec l'ID ${reservationId}`);
    }
    
    return facture;
  }
  
  // Méthode pour annuler un paiement (remboursement)
  async refundPayment(paymentId: string): Promise<Paiement | null> {
    const paiement = await this.paiementModel.findById(paymentId);
    
    if (!paiement) {
      throw new NotFoundException(`Paiement avec l'ID ${paymentId} non trouvé`);
    }
    
    // Vérifier que le paiement est dans un état où il peut être remboursé
    if (paiement.statut !== 'validé') {
      throw new BadRequestException('Ce paiement ne peut pas être remboursé dans son état actuel');
    }
    
    // Simuler un remboursement avec un service de paiement externe
    const remboursementReussi = await this.simulerRemboursement(paiement.reference, paiement.montant);
    
    if (!remboursementReussi) {
      throw new BadRequestException('Le remboursement a échoué. Veuillez réessayer ultérieurement.');
    }
    
    // Mettre à jour le paiement
    const updatedPaiement = await this.paiementModel.findByIdAndUpdate(
      paymentId,
      {
        statut: 'refusé', // Utilisation du statut refusé qui existe dans votre schéma
      },
      { new: true }
    );
    
    // Mettre à jour la facture associée
    const facture = await this.factureModel.findById(paiement.facture_id);
    
    if (facture) {
      await this.factureModel.findByIdAndUpdate(
        facture._id,
        {
          statut: 'annulée', // Utilisation de annulée avec accent
          notes: (facture.notes || '') + ' - Remboursement effectué',
        }
      );
    }
    
    // Mettre à jour la réservation
    const reservation = await this.reservationModel.findById(paiement.reservation_id);
    
    if (reservation) {
      await this.reservationModel.findByIdAndUpdate(
        reservation._id,
        {
          statut: 'annulee', // On garde la version sans accent pour être cohérent avec le schéma existant
          acompte_paye: false,
          montant_acompte: 0,
        }
      );
    }
    
    return updatedPaiement;
  }
  
  private async simulerRemboursement(reference: string, montant: number): Promise<boolean> {
    // Simulation d'un remboursement réussi
    // Dans un environnement réel, vous appelleriez un service de paiement externe ici
    
    // On peut simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  }
}
