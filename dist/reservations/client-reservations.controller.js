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
exports.ClientReservationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const reservations_service_1 = require("./reservations.service");
const update_reservation_dto_1 = require("./dto/update-reservation.dto");
const payment_service_1 = require("./payment.service");
const pdf_service_1 = require("../shared/pdf.service");
const mail_service_1 = require("../locations/mail.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const client_schema_1 = require("../schemas/client.schema");
const voiture_schema_1 = require("../schemas/voiture.schema");
let ClientReservationsController = class ClientReservationsController {
    constructor(reservationsService, paymentService, pdfService, mailService, clientModel, voitureModel) {
        this.reservationsService = reservationsService;
        this.paymentService = paymentService;
        this.pdfService = pdfService;
        this.mailService = mailService;
        this.clientModel = clientModel;
        this.voitureModel = voitureModel;
    }
    async getClientReservations(req, status) {
        const allReservations = await this.reservationsService.getUserReservations(req.user._id);
        if (!status) {
            return allReservations;
        }
        const now = new Date();
        if (status === 'upcoming') {
            return allReservations.filter(res => new Date(res.date_fin) >= now);
        }
        else if (status === 'past') {
            return allReservations.filter(res => new Date(res.date_fin) < now);
        }
        else if (['en_attente', 'confirmee', 'annulee', 'terminee'].includes(status)) {
            return allReservations.filter(res => res.statut === status);
        }
        return allReservations;
    }
    async getReservationHistory(req) {
        const reservations = await this.reservationsService.getUserReservations(req.user._id);
        return reservations.sort((a, b) => new Date(b.date_reservation).getTime() -
            new Date(a.date_reservation).getTime());
    }
    async getReservationDetails(id, req) {
        const reservation = await this.reservationsService.getReservationById(id);
        const userId = req.user._id.toString();
        const reservationUserId = this.getDocumentId(reservation.utilisateur_id);
        if (userId !== reservationUserId) {
            throw new common_1.UnauthorizedException("Vous n'êtes pas autorisé à voir cette réservation");
        }
        return reservation;
    }
    async updateReservation(id, updateReservationDto, req) {
        const reservation = await this.reservationsService.getReservationById(id);
        const userId = req.user._id.toString();
        const reservationUserId = this.getDocumentId(reservation.utilisateur_id);
        if (userId !== reservationUserId) {
            throw new common_1.UnauthorizedException("Vous n'êtes pas autorisé à modifier cette réservation");
        }
        if (reservation.statut !== 'en_attente') {
            throw new common_1.BadRequestException('Cette réservation ne peut plus être modifiée car elle a déjà été confirmée, terminée ou annulée');
        }
        delete updateReservationDto.statut;
        return this.reservationsService.updateReservation(id, updateReservationDto);
    }
    async cancelReservation(id, req) {
        const reservation = await this.reservationsService.getReservationById(id);
        const userId = req.user._id.toString();
        const reservationUserId = this.getDocumentId(reservation.utilisateur_id);
        if (userId !== reservationUserId) {
            throw new common_1.UnauthorizedException("Vous n'êtes pas autorisé à annuler cette réservation");
        }
        if (['annulee', 'terminee'].includes(reservation.statut)) {
            throw new common_1.BadRequestException("Cette réservation ne peut pas être annulée car elle est déjà terminée ou annulée");
        }
        const now = new Date();
        const dateDebut = new Date(reservation.date_debut);
        const diffTime = dateDebut.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let fraisAnnulation = 0;
        if (diffDays < 2) {
            fraisAnnulation = reservation.prix_total * 0.2;
        }
        let remboursementInfo = null;
        if (reservation.acompte_paye || reservation.statut === 'confirmee') {
            try {
                const facture = await this.paymentService.getReservationInvoice(id);
                const montantRembourse = Math.max(0, facture.montant_total - fraisAnnulation);
                remboursementInfo = {
                    montant_initial: facture.montant_total,
                    frais_annulation: fraisAnnulation,
                    montant_rembourse: montantRembourse,
                    date_remboursement: new Date(),
                };
            }
            catch (error) {
            }
        }
        await this.reservationsService.changeReservationStatus(id, 'annulee');
        return {
            message: "Réservation annulée avec succès",
            frais_annulation: fraisAnnulation,
            remboursement: remboursementInfo,
        };
    }
    async getReservationConfirmation(id, req, res) {
        try {
            const reservation = await this.reservationsService.getReservationById(id);
            if (!reservation) {
                throw new common_1.NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
            }
            const userId = req.user._id.toString();
            const reservationUserId = this.getDocumentId(reservation.utilisateur_id);
            if (userId !== reservationUserId) {
                throw new common_1.UnauthorizedException("Vous n'êtes pas autorisé à accéder à cette confirmation");
            }
            const user = reservation.utilisateur_id;
            const clientInfo = await this.clientModel.findOne({ utilisateur_id: userId });
            const vehicle = reservation.voiture_id;
            if (!vehicle || !vehicle.marque) {
                throw new common_1.BadRequestException(`Données du véhicule incomplètes ou manquantes pour la réservation ${id}`);
            }
            const PDFDocument = require('pdfkit');
            const fs = require('fs');
            const path = require('path');
            const axios = require('axios');
            const uploadsDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const fileName = `confirmation-${id}-${Date.now()}.pdf`;
            const filePath = path.join(uploadsDir, fileName);
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4',
                info: {
                    Title: `Confirmation de Réservation N° ${id}`,
                    Author: 'NDAMAAR',
                    Subject: 'Confirmation de réservation de véhicule',
                },
            });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);
            const primaryColor = '#333333';
            const secondaryColor = '#666666';
            const accentColor = '#0056b3';
            const bgLight = '#f8f9fa';
            try {
                const logoUrl = 'https://res.cloudinary.com/dhivn2ahm/image/upload/v1740850713/Grey_and_Black2_Car_Rental_Service_Logo_nrbxc0.png';
                const logoResponse = await axios.get(logoUrl, { responseType: 'arraybuffer' });
                const logoBuffer = Buffer.from(logoResponse.data, 'binary');
                doc.image(logoBuffer, doc.page.width / 2 - 100, 40, {
                    fit: [200, 100],
                    align: 'center',
                    valign: 'center'
                });
                doc.moveDown(5);
            }
            catch (logoError) {
                console.error('Erreur lors du chargement du logo:', logoError);
                doc.moveDown();
            }
            doc
                .font('Helvetica-Bold')
                .fontSize(24)
                .fillColor(accentColor)
                .text('CONFIRMATION DE RÉSERVATION', { align: 'center' });
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y)
                .lineTo(doc.page.width - 50, doc.y)
                .strokeColor(accentColor)
                .lineWidth(1.5)
                .stroke();
            doc.moveDown(1);
            doc.fontSize(16)
                .fillColor(primaryColor)
                .text(`Numéro de réservation: ${id}`);
            doc.moveDown();
            const clientBoxY = doc.y;
            doc.rect(50, clientBoxY, doc.page.width - 100, 80)
                .fillAndStroke(bgLight, accentColor);
            doc.fillColor(primaryColor)
                .fontSize(14)
                .text('Informations Client', 60, clientBoxY + 10);
            doc.fontSize(12)
                .fillColor(secondaryColor)
                .text(`Client: ${user.prenom} ${user.nom}`, 60, clientBoxY + 30);
            doc.text(`Email: ${user.email}`, 60, clientBoxY + 45);
            if (clientInfo) {
                if (clientInfo.telephone)
                    doc.text(`Téléphone: ${clientInfo.telephone}`, 60, clientBoxY + 60);
                if (clientInfo.adresse)
                    doc.text(`Adresse: ${clientInfo.adresse}`, 300, clientBoxY + 45);
            }
            doc.moveDown(5);
            const vehicleBoxY = doc.y;
            doc.rect(50, vehicleBoxY, doc.page.width - 100, 100)
                .fillAndStroke('#f0f7ff', '#b8daff');
            doc.fillColor(primaryColor)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('Détails du véhicule', 60, vehicleBoxY + 10);
            doc.fontSize(12)
                .font('Helvetica')
                .fillColor(secondaryColor)
                .text(`Marque: ${vehicle.marque}`, 60, vehicleBoxY + 30);
            doc.text(`Modèle: ${vehicle.modele}`, 60, vehicleBoxY + 45);
            doc.text(`Année: ${vehicle.annee}`, 60, vehicleBoxY + 60);
            if (vehicle.code)
                doc.text(`Code: ${vehicle.code}`, 300, vehicleBoxY + 30);
            if (vehicle.categorie)
                doc.text(`Catégorie: ${vehicle.categorie}`, 300, vehicleBoxY + 45);
            doc.moveDown(6);
            const dateBoxY = doc.y;
            doc.rect(50, dateBoxY, doc.page.width - 100, 75)
                .fillAndStroke('#f3f3f3', '#dddddd');
            doc.fillColor(primaryColor)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('Période de location', 60, dateBoxY + 10);
            doc.fontSize(12)
                .font('Helvetica')
                .fillColor(secondaryColor)
                .text(`Du: ${new Date(reservation.date_debut).toLocaleDateString()}`, 60, dateBoxY + 30);
            doc.text(`Au: ${new Date(reservation.date_fin).toLocaleDateString()}`, 60, dateBoxY + 45);
            doc.text(`Date de réservation: ${new Date(reservation.date_reservation).toLocaleDateString()}`, 300, dateBoxY + 30);
            doc.moveDown(5);
            if (reservation.options && reservation.options.length > 0) {
                const optionsBoxY = doc.y;
                const optionsBoxHeight = 30 + (reservation.options.length * 15);
                doc.rect(50, optionsBoxY, doc.page.width - 100, optionsBoxHeight)
                    .fillAndStroke('#f9f9f9', '#dddddd');
                doc.fillColor(primaryColor)
                    .fontSize(14)
                    .font('Helvetica-Bold')
                    .text('Options supplémentaires', 60, optionsBoxY + 10);
                let optionY = optionsBoxY + 30;
                reservation.options.forEach(option => {
                    doc.fontSize(12)
                        .font('Helvetica')
                        .fillColor(secondaryColor)
                        .text(`- ${option.nom}: ${option.prix} FCFA`, 60, optionY);
                    optionY += 15;
                });
                doc.moveDown(optionsBoxHeight / 15);
            }
            doc.rect(doc.page.width / 2, doc.y, doc.page.width / 2 - 50, 30)
                .fillAndStroke(accentColor, accentColor);
            doc.fontSize(16)
                .font('Helvetica-Bold')
                .fillColor('white')
                .text(`Prix total: ${reservation.prix_total.toLocaleString()} FCFA`, doc.page.width / 2 + 10, doc.y - 25, { width: doc.page.width / 2 - 70, align: 'right' });
            doc.moveDown(2);
            const statusLabel = {
                'en_attente': 'En attente de confirmation',
                'confirmee': 'Confirmée',
                'annulee': 'Annulée',
                'terminee': 'Terminée'
            };
            const statusColor = {
                'en_attente': '#ff9800',
                'confirmee': '#4caf50',
                'annulee': '#f44336',
                'terminee': '#2196f3'
            };
            const statusBoxY = doc.y;
            doc.rect(50, statusBoxY, 200, 30)
                .fillAndStroke(statusColor[reservation.statut] || primaryColor, statusColor[reservation.statut] || primaryColor);
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('white')
                .text(`Statut: ${statusLabel[reservation.statut] || reservation.statut}`, 60, statusBoxY + 8);
            if (reservation.acompte_paye) {
                doc.moveDown(2);
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor(primaryColor)
                    .text(`Acompte payé: ${reservation.montant_acompte.toLocaleString()} FCFA`);
            }
            doc.moveDown(2);
            const infoBoxY = doc.y;
            doc.rect(50, infoBoxY, doc.page.width - 100, 120)
                .fillAndStroke('#f5f5f5', '#dddddd');
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor(primaryColor)
                .text('Instructions et conditions', 60, infoBoxY + 10);
            doc.fontSize(10)
                .font('Helvetica')
                .fillColor(secondaryColor)
                .text('Veuillez présenter ce document lors de la prise en charge du véhicule.', 60, infoBoxY + 30);
            doc.text('Une pièce d\'identité et un permis de conduire valide seront demandés.', 60, infoBoxY + 45);
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .fillColor(primaryColor)
                .text('Conditions d\'annulation:', 60, infoBoxY + 65);
            doc.fontSize(10)
                .font('Helvetica')
                .fillColor(secondaryColor)
                .text('- Annulation gratuite jusqu\'à 48h avant la date de début de location', 70, infoBoxY + 80);
            doc.text('- Annulation à moins de 48h: 20% de frais d\'annulation', 70, infoBoxY + 95);
            doc.text('- Non-présentation: aucun remboursement', 70, infoBoxY + 110);
            doc.fontSize(10)
                .font('Helvetica')
                .fillColor(secondaryColor);
            const footerY = doc.page.height - 50;
            doc.moveTo(50, footerY - 20)
                .lineTo(doc.page.width - 50, footerY - 20)
                .strokeColor('#dddddd')
                .lineWidth(1)
                .stroke();
            doc.text('NDAMAAR Location de véhicules', doc.page.width / 2 - 80, footerY);
            doc.text('Confirmation générée le ' + new Date().toLocaleDateString(), doc.page.width / 2 - 80, footerY + 15);
            doc.text('Contact : 06 99 99 99 99', doc.page.width / 2 - 80, footerY + 30);
            doc.end();
            return new Promise((resolve, reject) => {
                stream.on('finish', () => {
                    res.sendFile(filePath);
                    resolve(true);
                });
                stream.on('error', (error) => {
                    reject(error);
                });
            });
        }
        catch (error) {
            console.error('Erreur détaillée:', error);
            throw new common_1.BadRequestException(`Erreur lors de la génération du PDF: ${error.message}`);
        }
    }
    async getReservationInvoice(id, req, res) {
        try {
            const reservation = await this.reservationsService.getReservationById(id);
            if (!reservation) {
                throw new common_1.NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
            }
            const userId = req.user._id.toString();
            const reservationUserId = this.getDocumentId(reservation.utilisateur_id);
            if (userId !== reservationUserId) {
                throw new common_1.UnauthorizedException("Vous n'êtes pas autorisé à accéder à cette facture");
            }
            const user = reservation.utilisateur_id;
            const clientInfo = await this.clientModel.findOne({ utilisateur_id: userId });
            const vehicle = reservation.voiture_id;
            if (!vehicle || !vehicle.marque) {
                console.warn(`Données du véhicule incomplètes pour la réservation ${id}, utilisation de valeurs par défaut`);
            }
            let facture;
            try {
                facture = await this.paymentService.getReservationInvoice(id);
            }
            catch (error) {
                console.warn(`Aucune facture existante pour la réservation ${id}, création d'une facture temporaire`);
                facture = {
                    date_emission: new Date(),
                    date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)),
                    montant_total: reservation.prix_total || 0,
                    notes: 'Facture temporaire générée automatiquement.'
                };
            }
            const pdfData = {
                numero: `FACT-${id}`,
                date_emission: facture.date_emission || new Date(),
                date_echeance: facture.date_echeance || new Date(),
                notes: facture.notes || 'Merci de votre confiance.',
                Fields: {
                    remise: 0
                },
                client: {
                    nom: user.nom || '',
                    prenom: user.prenom || '',
                    email: user.email || '',
                    telephone: clientInfo?.telephone || '',
                    adresse: clientInfo?.adresse || '',
                },
                reservation: {
                    date_debut: reservation.date_debut,
                    date_fin: reservation.date_fin,
                },
                location: {
                    km_depart: 0,
                    km_retour: 0,
                },
                voiture: {
                    marque: vehicle?.marque || 'Non spécifié',
                    modele: vehicle?.modele || 'Non spécifié',
                    annee: vehicle?.annee || new Date().getFullYear(),
                    prix_location: vehicle?.prix_location || reservation.prix_total || 0,
                },
                cout_base: facture.montant_total || reservation.prix_total || 0,
                frais_supplementaires: 0,
                montant_total: facture.montant_total || reservation.prix_total || 0,
                paiements: [],
            };
            try {
                const paiements = await this.paymentService.getReservationPayments(id);
                if (paiements && paiements.length > 0) {
                    const paiementsFormats = paiements.map(p => ({
                        date_paiement: p.date_paiement,
                        montant: p.montant,
                    }));
                    Object.assign(pdfData, { paiements: paiementsFormats });
                }
            }
            catch (error) {
                console.log('Aucun paiement trouvé pour cette réservation:', error.message);
            }
            const pdfPath = await this.pdfService.generateInvoice(pdfData, facture);
            return res.sendFile(pdfPath);
        }
        catch (error) {
            console.error('Erreur détaillée lors de la génération de la facture:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Erreur lors de la génération de la facture: ${error.message}`);
        }
    }
    async sendInvoiceByEmail(id, req) {
        try {
            const reservation = await this.reservationsService.getReservationById(id);
            if (!reservation) {
                throw new common_1.NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
            }
            const userId = req.user._id.toString();
            const reservationUserId = this.getDocumentId(reservation.utilisateur_id);
            if (userId !== reservationUserId) {
                throw new common_1.UnauthorizedException("Vous n'êtes pas autorisé à demander l'envoi de cette facture");
            }
            const user = reservation.utilisateur_id;
            if (!user) {
                throw new common_1.BadRequestException("Impossible de récupérer les informations utilisateur");
            }
            const clientEmail = user.email;
            if (!clientEmail) {
                throw new common_1.BadRequestException("Impossible d'envoyer la facture: adresse email du client manquante");
            }
            const clientInfo = await this.clientModel.findOne({ utilisateur_id: userId });
            const vehicle = reservation.voiture_id;
            if (!vehicle || !vehicle.marque) {
                console.warn(`Données du véhicule incomplètes pour la réservation ${id}, utilisation de valeurs par défaut`);
            }
            let facture;
            try {
                facture = await this.paymentService.getReservationInvoice(id);
            }
            catch (error) {
                console.warn(`Aucune facture existante pour la réservation ${id}, création d'une facture temporaire`);
                facture = {
                    date_emission: new Date(),
                    date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)),
                    montant_total: reservation.prix_total || 0,
                    notes: 'Facture temporaire générée automatiquement.'
                };
            }
            const pdfData = {
                numero: `FACT-${id}`,
                date_emission: facture.date_emission || new Date(),
                date_echeance: facture.date_echeance || new Date(),
                notes: facture.notes || 'Merci de votre confiance.',
                Fields: {
                    remise: 0,
                },
                client: {
                    nom: user.nom || '',
                    prenom: user.prenom || '',
                    email: user.email || '',
                    telephone: clientInfo?.telephone || '',
                    adresse: clientInfo?.adresse || '',
                },
                reservation: {
                    date_debut: reservation.date_debut,
                    date_fin: reservation.date_fin,
                },
                location: {
                    km_depart: 0,
                    km_retour: 0,
                },
                voiture: {
                    marque: vehicle?.marque || 'Non spécifié',
                    modele: vehicle?.modele || 'Non spécifié',
                    annee: vehicle?.annee || new Date().getFullYear(),
                    prix_location: vehicle?.prix_location || reservation.prix_total || 0,
                },
                cout_base: facture.montant_total || reservation.prix_total || 0,
                frais_supplementaires: 0,
                montant_total: facture.montant_total || reservation.prix_total || 0,
                paiements: [],
            };
            try {
                const paiements = await this.paymentService.getReservationPayments(id);
                if (paiements && paiements.length > 0) {
                    const paiementsFormats = paiements.map(p => ({
                        date_paiement: p.date_paiement,
                        montant: p.montant,
                    }));
                    Object.assign(pdfData, { paiements: paiementsFormats });
                }
            }
            catch (error) {
                console.log('Aucun paiement trouvé pour cette réservation:', error.message);
            }
            const pdfPath = await this.pdfService.generateInvoice(pdfData, facture);
            await this.mailService.sendInvoiceEmail(clientEmail, `Votre facture NDAMAAR - Réservation ${id}`, `Bonjour ${user.prenom} ${user.nom},\n\nVeuillez trouver ci-joint votre facture pour la réservation de véhicule.\n\nCordialement,\nL'équipe NDAMAAR`, pdfPath);
            return {
                success: true,
                message: `Facture envoyée à ${clientEmail}`,
            };
        }
        catch (error) {
            console.error('Erreur détaillée lors de l\'envoi de la facture:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Erreur lors de l'envoi de la facture: ${error.message}`);
        }
    }
    getDocumentId(doc) {
        if (!doc)
            return '';
        if (typeof doc === 'string')
            return doc;
        if (doc._id)
            return doc._id.toString();
        return '';
    }
};
exports.ClientReservationsController = ClientReservationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClientReservationsController.prototype, "getClientReservations", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientReservationsController.prototype, "getReservationHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientReservationsController.prototype, "getReservationDetails", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reservation_dto_1.UpdateReservationDto, Object]),
    __metadata("design:returntype", Promise)
], ClientReservationsController.prototype, "updateReservation", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientReservationsController.prototype, "cancelReservation", null);
__decorate([
    (0, common_1.Get)(':id/confirmation'),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename=confirmation.pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ClientReservationsController.prototype, "getReservationConfirmation", null);
__decorate([
    (0, common_1.Get)(':id/facture'),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename=facture.pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ClientReservationsController.prototype, "getReservationInvoice", null);
__decorate([
    (0, common_1.Get)(':id/send-facture'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientReservationsController.prototype, "sendInvoiceByEmail", null);
exports.ClientReservationsController = ClientReservationsController = __decorate([
    (0, common_1.Controller)('client/reservations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(4, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __param(5, (0, mongoose_1.InjectModel)(voiture_schema_1.Voiture.name)),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService,
        payment_service_1.PaymentService,
        pdf_service_1.PdfService,
        mail_service_1.MailService,
        mongoose_2.Model,
        mongoose_2.Model])
], ClientReservationsController);
//# sourceMappingURL=client-reservations.controller.js.map