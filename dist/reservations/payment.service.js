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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transaction_schema_1 = require("../schemas/transaction.schema");
const reservation_schema_1 = require("../schemas/reservation.schema");
const paiement_schema_1 = require("../schemas/paiement.schema");
const facture_schema_1 = require("../schemas/facture.schema");
const user_schema_1 = require("../schemas/user.schema");
const pdf_service_1 = require("../shared/pdf.service");
let PaymentService = class PaymentService {
    constructor(transactionModel, reservationModel, paiementModel, factureModel, userModel, pdfService) {
        this.transactionModel = transactionModel;
        this.reservationModel = reservationModel;
        this.paiementModel = paiementModel;
        this.factureModel = factureModel;
        this.userModel = userModel;
        this.pdfService = pdfService;
    }
    async processPayment(userId, paymentDto) {
        const reservation = await this.reservationModel.findById(paymentDto.reservation_id)
            .populate('voiture_id')
            .populate('utilisateur_id');
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${paymentDto.reservation_id} non trouvée`);
        }
        if (reservation.utilisateur_id.toString() === userId) {
            throw new common_1.BadRequestException('Vous n\'êtes pas autorisé à payer cette réservation');
        }
        if (reservation.statut !== 'en_attente') {
            throw new common_1.BadRequestException('Cette réservation ne peut pas être payée dans son état actuel');
        }
        if (reservation.etape_reservation !== 4) {
            await this.reservationModel.findByIdAndUpdate(paymentDto.reservation_id, { etape_reservation: 4 });
        }
        const montantTotal = reservation.prix_total;
        const montantAcompte = Math.round(montantTotal * 0.3);
        const montantAPayer = paymentDto.payer_acompte ? montantAcompte : montantTotal;
        const paiementReussi = await this.simulerPaiement(paymentDto.token_paiement || 'default_token', montantAPayer);
        if (!paiementReussi) {
            throw new common_1.BadRequestException('Le paiement a échoué. Veuillez réessayer avec une autre méthode de paiement.');
        }
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
        const nouveauStatut = paymentDto.payer_acompte ? 'en_attente' : 'confirmee';
        await this.reservationModel.findByIdAndUpdate(paymentDto.reservation_id, {
            acompte_paye: paymentDto.payer_acompte,
            montant_acompte: paymentDto.payer_acompte ? montantAcompte : 0,
            etape_reservation: 5,
            statut: nouveauStatut,
        });
        if (nouveauStatut === 'confirmee') {
            const voitureId = reservation.voiture_id;
        }
        return savedTransaction;
    }
    async getPaymentMethods() {
        return ['carte_credit', 'paypal', 'virement_bancaire', 'especes'];
    }
    async payRemainingAmount(userId, reservationId, paymentMethod, token) {
        const reservation = await this.reservationModel.findById(reservationId);
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${reservationId} non trouvée`);
        }
        if (reservation.utilisateur_id.toString() === userId) {
            throw new common_1.BadRequestException('Vous n\'êtes pas autorisé à payer cette réservation');
        }
        if (!reservation.acompte_paye) {
            throw new common_1.BadRequestException("'Aucun acompte n'a été payé pour cette réservation  s,,'");
        }
        if (reservation.statut === 'confirmee') {
            throw new common_1.BadRequestException('Cette réservation a déjà été entièrement payée');
        }
        const montantTotal = reservation.prix_total;
        const montantAcompte = reservation.montant_acompte;
        const montantRestant = montantTotal - montantAcompte;
        const paiementReussi = await this.simulerPaiement(token || 'default_token', montantRestant);
        if (!paiementReussi) {
            throw new common_1.BadRequestException('Le paiement a échoué. Veuillez réessayer avec une autre méthode de paiement.');
        }
        const facture = await this.factureModel.findOne({ reservation_id: reservationId });
        if (!facture) {
            throw new common_1.NotFoundException('Facture non trouvée pour cette réservation');
        }
        await this.factureModel.findByIdAndUpdate(facture._id, {
            notes: facture.notes + ' - Paiement final effectué',
            statut: 'payée',
        });
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
        await this.reservationModel.findByIdAndUpdate(reservationId, {
            acompte_paye: false,
            statut: 'confirmee',
        });
        return savedTransaction;
    }
    async simulerPaiement(token, montant) {
        const randomSuccess = Math.random() > 0.1;
        await new Promise(resolve => setTimeout(resolve, 1000));
        return randomSuccess;
    }
    generatePaymentReference() {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 10000);
        return `PAY-${timestamp}-${random}`;
    }
    async getReservationPayments(reservationId) {
        return this.paiementModel.find({ reservation_id: reservationId }).exec();
    }
    async getReservationInvoice(reservationId) {
        const facture = await this.factureModel.findOne({ reservation_id: reservationId }).exec();
        if (!facture) {
            throw new common_1.NotFoundException(`Facture non trouvée pour la réservation avec l'ID ${reservationId}`);
        }
        return facture;
    }
    async refundPayment(paymentId) {
        const paiement = await this.paiementModel.findById(paymentId);
        if (!paiement) {
            throw new common_1.NotFoundException(`Paiement avec l'ID ${paymentId} non trouvé`);
        }
        if (paiement.statut !== 'validé') {
            throw new common_1.BadRequestException('Ce paiement ne peut pas être remboursé dans son état actuel');
        }
        const remboursementReussi = await this.simulerRemboursement(paiement.reference, paiement.montant);
        if (!remboursementReussi) {
            throw new common_1.BadRequestException('Le remboursement a échoué. Veuillez réessayer ultérieurement.');
        }
        const updatedPaiement = await this.paiementModel.findByIdAndUpdate(paymentId, {
            statut: 'refusé',
        }, { new: true });
        const facture = await this.factureModel.findById(paiement.facture_id);
        if (facture) {
            await this.factureModel.findByIdAndUpdate(facture._id, {
                statut: 'annulée',
                notes: (facture.notes || '') + ' - Remboursement effectué',
            });
        }
        const reservation = await this.reservationModel.findById(paiement.reservation_id);
        if (reservation) {
            await this.reservationModel.findByIdAndUpdate(reservation._id, {
                statut: 'annulee',
                acompte_paye: false,
                montant_acompte: 0,
            });
        }
        return updatedPaiement;
    }
    async simulerRemboursement(reference, montant) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
    }
    async generateInvoicePdf(reservationId) {
        const reservation = await this.reservationModel
            .findById(reservationId)
            .populate('voiture_id')
            .populate('utilisateur_id')
            .populate('options')
            .populate('offre_id');
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${reservationId} non trouvée`);
        }
        const facture = await this.factureModel.findOne({
            eservation_id: reservationId,
        });
        if (!facture) {
            throw new common_1.NotFoundException(`Aucune facture trouvée pour la réservation ${reservationId}`);
        }
        const filePath = await this.pdfService.generateInvoice(reservation, facture);
        const fileName = `facture-${facture._id}.pdf`;
        return { filePath, fileName };
    }
    async getInvoicePdfPath(reservationId) {
        try {
            const existingFilePath = await this.findExistingInvoicePdf(reservationId);
            if (existingFilePath) {
                return existingFilePath;
            }
            return this.generateInvoicePdf(reservationId);
        }
        catch (error) {
            throw new common_1.NotFoundException(`Impossible de générer la facture: ${error.message}`);
        }
    }
    async findExistingInvoicePdf(reservationId) {
        return null;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __param(1, (0, mongoose_1.InjectModel)(reservation_schema_1.Reservation.name)),
    __param(2, (0, mongoose_1.InjectModel)(paiement_schema_1.Paiement.name)),
    __param(3, (0, mongoose_1.InjectModel)(facture_schema_1.Facture.name)),
    __param(4, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        pdf_service_1.PdfService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map