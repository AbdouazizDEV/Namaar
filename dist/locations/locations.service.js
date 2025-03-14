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
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const location_schema_1 = require("../schemas/location.schema");
const reservation_schema_1 = require("../schemas/reservation.schema");
const voiture_schema_1 = require("../schemas/voiture.schema");
const user_schema_1 = require("../schemas/user.schema");
const facture_schema_1 = require("../schemas/facture.schema");
const paiement_schema_1 = require("../schemas/paiement.schema");
const client_schema_1 = require("../schemas/client.schema");
const offre_schema_1 = require("../schemas/offre.schema");
const mail_service_1 = require("./mail.service");
const pdf_service_1 = require("./pdf.service");
let LocationsService = class LocationsService {
    constructor(locationModel, reservationModel, voitureModel, userModel, factureModel, paiementModel, clientModel, offreModel, mailService, pdfService) {
        this.locationModel = locationModel;
        this.reservationModel = reservationModel;
        this.voitureModel = voitureModel;
        this.userModel = userModel;
        this.factureModel = factureModel;
        this.paiementModel = paiementModel;
        this.clientModel = clientModel;
        this.offreModel = offreModel;
        this.mailService = mailService;
        this.pdfService = pdfService;
    }
    async getAllLocations() {
        return this.locationModel
            .find()
            .populate({
            path: 'reservation_id',
            populate: [
                { path: 'utilisateur_id', select: '-mot_de_passe' },
                { path: 'voiture_id' },
            ],
        })
            .exec();
    }
    async getLocationById(id) {
        const location = await this.locationModel
            .findById(id)
            .populate({
            path: 'reservation_id',
            populate: [
                { path: 'utilisateur_id', select: '-mot_de_passe' },
                { path: 'voiture_id' },
            ],
        })
            .exec();
        if (!location) {
            throw new common_1.NotFoundException(`Contrat de location avec l'ID ${id} non trouvé`);
        }
        return location;
    }
    async startContract(startContractDto) {
        const reservation = await this.reservationModel
            .findById(startContractDto.reservation_id)
            .populate('voiture_id')
            .populate('utilisateur_id')
            .exec();
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${startContractDto.reservation_id} non trouvée`);
        }
        if (reservation.statut !== 'confirmee') {
            throw new common_1.BadRequestException('Seules les réservations confirmées peuvent devenir des contrats de location');
        }
        const existingContract = await this.locationModel.findOne({
            reservation_id: startContractDto.reservation_id
        }).exec();
        if (existingContract) {
            throw new common_1.BadRequestException('Un contrat de location existe déjà pour cette réservation');
        }
        const newLocation = new this.locationModel({
            reservation_id: startContractDto.reservation_id,
            date_debut_reelle: new Date(),
            km_depart: startContractDto.km_depart,
            etat_depart: startContractDto.etat_depart,
            statut: 'en_cours',
        });
        const savedLocation = await newLocation.save();
        const voitureId = typeof reservation.voiture_id === 'string'
            ? reservation.voiture_id
            : reservation.voiture_id._id;
        await this.voitureModel.findByIdAndUpdate(voitureId, { disponibilite: false });
        return savedLocation;
    }
    async endContract(id, endContractDto) {
        const location = await this.locationModel.findById(id).populate({
            path: 'reservation_id',
            populate: [
                { path: 'utilisateur_id' },
                { path: 'voiture_id' },
                { path: 'offre_id' },
            ],
        }).exec();
        if (!location) {
            throw new common_1.NotFoundException(`Contrat de location avec l'ID ${id} non trouvé`);
        }
        if (location.statut !== 'en_cours') {
            throw new common_1.BadRequestException('Ce contrat de location est déjà terminé ou en retard');
        }
        location.date_fin_reelle = new Date();
        location.km_retour = endContractDto.km_retour;
        location.etat_retour = endContractDto.etat_retour;
        location.frais_supplementaires = endContractDto.frais_supplementaires || 0;
        location.statut = 'terminee';
        const updatedLocation = await location.save();
        const reservationId = typeof location.reservation_id === 'string'
            ? location.reservation_id
            : location.reservation_id._id;
        await this.reservationModel.findByIdAndUpdate(reservationId, { statut: 'terminee' });
        const reservation = await this.reservationModel.findById(reservationId).populate('voiture_id').exec();
        if (reservation) {
            const voitureId = typeof reservation.voiture_id === 'string'
                ? reservation.voiture_id
                : reservation.voiture_id._id;
            await this.voitureModel.findByIdAndUpdate(voitureId, { disponibilite: true });
        }
        const facture = await this.generateInvoice(updatedLocation);
        return {
            location: updatedLocation,
            facture,
        };
    }
    async createTestInvoice(testData) {
        const reservation = await this.reservationModel.findById(testData.reservation_id).exec();
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${testData.reservation_id} non trouvée`);
        }
        const client = await this.clientModel.findById(testData.client_id).exec();
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'ID ${testData.client_id} non trouvé`);
        }
        const nouvelleFacture = new this.factureModel({
            reservation_id: testData.reservation_id,
            client_id: testData.client_id,
            date_emission: new Date(),
            date_echeance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            montant_total: testData.montant_total || 50000,
            notes: "Facture de test",
            statut: 'en_attente',
        });
        const factureEnregistree = await nouvelleFacture.save();
        return factureEnregistree;
    }
    async generateInvoice(location) {
        const reservation = await this.reservationModel
            .findById(location.reservation_id)
            .populate('utilisateur_id')
            .populate('voiture_id')
            .populate('offre_id')
            .exec();
        if (!reservation) {
            throw new common_1.NotFoundException(`Réservation avec l'ID ${location.reservation_id} non trouvée`);
        }
        if (!reservation.utilisateur_id) {
            console.log("Attention : utilisateur_id est null pour la réservation", reservation._id);
            const nouvelleFacture = new this.factureModel({
                reservation_id: reservation._id,
                client_id: null,
                date_emission: new Date(),
                date_echeance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                montant_total: reservation.prix_total + (location.frais_supplementaires || 0),
                notes: location.frais_supplementaires
                    ? `Frais supplémentaires ajoutés : ${location.frais_supplementaires} FCFA`
                    : '',
                statut: 'en_attente',
            });
            const factureEnregistree = await nouvelleFacture.save();
            return factureEnregistree;
        }
        let userId;
        try {
            if (typeof reservation.utilisateur_id === 'string') {
                userId = reservation.utilisateur_id;
            }
            else {
                userId = reservation.utilisateur_id._id.toString();
            }
        }
        catch (error) {
            console.error('Erreur lors de l\'extraction de l\'ID utilisateur:', error);
            console.log('Réservation:', reservation);
            console.log('Utilisateur ID:', reservation.utilisateur_id);
            throw new common_1.BadRequestException('ID utilisateur non trouvé dans la réservation');
        }
        const client = await this.clientModel
            .findOne({ utilisateur_id: userId })
            .exec();
        const montantTotal = reservation.prix_total + (location.frais_supplementaires || 0);
        const nouvelleFacture = new this.factureModel({
            reservation_id: reservation._id,
            client_id: client?._id,
            date_emission: new Date(),
            date_echeance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            montant_total: montantTotal,
            notes: location.frais_supplementaires
                ? `Frais supplémentaires ajoutés : ${location.frais_supplementaires} FCFA`
                : '',
            statut: 'en_attente',
        });
        const factureEnregistree = await nouvelleFacture.save();
        const userData = {
            nom: '',
            prenom: '',
            email: ''
        };
        if (typeof reservation.utilisateur_id !== 'string') {
            const user = reservation.utilisateur_id;
            userData.nom = user.nom || '';
            userData.prenom = user.prenom || '';
            userData.email = user.email || '';
        }
        const voitureData = {
            marque: typeof reservation.voiture_id === 'string' ? 'N/A' :
                reservation.voiture_id.marque || 'N/A',
            modele: typeof reservation.voiture_id === 'string' ? 'N/A' :
                reservation.voiture_id.modele || 'N/A',
            annee: typeof reservation.voiture_id === 'string' ? 0 :
                reservation.voiture_id.annee || 0,
            prix_location: typeof reservation.voiture_id === 'string' ? 0 :
                reservation.voiture_id.prix_location || 0
        };
        let remise = 0;
        if (reservation.offre_id) {
            let offre = null;
            if (typeof reservation.offre_id === 'string') {
                offre = await this.offreModel.findById(reservation.offre_id).exec();
            }
            else {
                offre = reservation.offre_id;
            }
            if (offre && 'reduction' in offre) {
                remise = (offre.reduction / 100) * reservation.prix_total;
            }
        }
        const invoiceData = {
            numero: factureEnregistree._id
                ? factureEnregistree._id.toString().slice(-6).toUpperCase() : 'XXXXXX',
            date_emission: factureEnregistree.date_emission,
            date_echeance: factureEnregistree.date_echeance,
            client: {
                nom: userData.nom,
                prenom: userData.prenom,
                email: userData.email,
                telephone: client?.telephone || 'Non renseigné',
                adresse: client?.adresse || 'Non renseignée',
            },
            voiture: voitureData,
            reservation: {
                date_debut: reservation.date_debut,
                date_fin: reservation.date_fin,
            },
            location: {
                km_depart: location.km_depart,
                km_retour: location.km_retour || 0,
                frais_supplementaires: location.frais_supplementaires || 0,
            },
            cout_base: reservation.prix_total,
            remise: remise,
            montant_total: montantTotal,
            notes: nouvelleFacture.notes,
            Fields: { remise },
            frais_supplementaires: location.frais_supplementaires || 0,
            paiements: [],
        };
        try {
            const pdfPath = await this.pdfService.generateInvoice(invoiceData);
            if (userData.email) {
                try {
                    await this.mailService.sendInvoiceEmail(userData.email, 'Votre facture de location NDAMAAR', `Cher(e) ${userData.prenom} ${userData.nom},\n\nVeuillez trouver ci-joint votre facture pour votre récente location de véhicule.\n\nMontant total : ${montantTotal} FCFA\nDate d'échéance : ${new Date(factureEnregistree.date_echeance).toLocaleDateString()}\n\nMerci de votre confiance.\n\nL'équipe NDAMAAR`, pdfPath);
                }
                catch (error) {
                    console.error("Erreur lors de l'envoi de l'email :", error);
                }
            }
            return factureEnregistree;
        }
        catch (error) {
            console.error("Erreur lors de la génération du PDF :", error);
            return factureEnregistree;
        }
    }
    async createPayment(reservationId, createPaymentDto) {
        const facture = await this.factureModel.findById(createPaymentDto.facture_id).exec();
        if (!facture) {
            throw new common_1.NotFoundException(`Facture avec l'ID ${createPaymentDto.facture_id} non trouvée`);
        }
        if (facture.reservation_id.toString() !== reservationId) {
            throw new common_1.BadRequestException('Cette facture ne correspond pas à la réservation spécifiée');
        }
        const nouveauPaiement = new this.paiementModel({
            facture_id: createPaymentDto.facture_id,
            reservation_id: reservationId,
            montant: createPaymentDto.montant,
            methode: createPaymentDto.methode,
            reference: createPaymentDto.reference,
            date_paiement: new Date(),
            statut: createPaymentDto.statut || 'validé',
        });
        const paiementEnregistre = await nouveauPaiement.save();
        if (createPaymentDto.statut === 'validé' || createPaymentDto.statut === undefined) {
            const paiementsValides = await this.paiementModel.find({
                facture_id: createPaymentDto.facture_id,
                statut: 'validé',
            }).exec();
            const totalPaye = paiementsValides.reduce((acc, p) => acc + p.montant, 0);
            if (totalPaye >= facture.montant_total) {
                facture.statut = 'payée';
                await facture.save();
            }
        }
        return paiementEnregistre;
    }
    async getInvoices(clientId) {
        let query = {};
        if (clientId) {
            const client = await this.clientModel.findOne({ utilisateur_id: clientId }).exec();
            if (!client) {
                throw new common_1.NotFoundException(`Client avec l'ID ${clientId} non trouvé`);
            }
            query = { client_id: client._id };
        }
        return this.factureModel
            .find(query)
            .populate('reservation_id')
            .populate('client_id')
            .exec();
    }
    async getInvoiceById(id) {
        const facture = await this.factureModel
            .findById(id)
            .populate({
            path: 'reservation_id',
            populate: [
                { path: 'utilisateur_id', select: '-mot_de_passe' },
                { path: 'voiture_id' },
            ],
        })
            .populate({
            path: 'client_id',
            populate: { path: 'utilisateur_id', select: '-mot_de_passe' },
        })
            .exec();
        if (!facture) {
            throw new common_1.NotFoundException(`Facture avec l'ID ${id} non trouvée`);
        }
        const paiements = await this.paiementModel.find({ facture_id: id }).exec();
        return {
            facture,
            paiements,
        };
    }
    async getPayments(factureId) {
        let query = {};
        if (factureId) {
            query = { facture_id: factureId };
        }
        return this.paiementModel
            .find(query)
            .populate('facture_id')
            .populate('reservation_id')
            .exec();
    }
    async generateInvoicePdf(factureId) {
        const { facture } = await this.getInvoiceById(factureId);
        const reservation = await this.reservationModel.findById(facture.reservation_id)
            .populate('utilisateur_id')
            .populate('voiture_id')
            .populate('offre_id')
            .exec();
        const location = await this.locationModel.findOne({ reservation_id: facture.reservation_id }).exec();
        if (!reservation || !location) {
            throw new common_1.NotFoundException(`Données incomplètes pour la facture ${factureId}`);
        }
        const userData = typeof reservation.utilisateur_id === 'string'
            ? { nom: 'Client', prenom: '', email: '' }
            : {
                nom: reservation.utilisateur_id.nom || '',
                prenom: reservation.utilisateur_id.prenom || '',
                email: reservation.utilisateur_id.email || ''
            };
        const voitureData = typeof reservation.voiture_id === 'string'
            ? { marque: 'N/A', modele: 'N/A', annee: 0 }
            : reservation.voiture_id;
        let remise = 0;
        if (reservation.offre_id) {
            const offre = typeof reservation.offre_id === 'string'
                ? await this.offreModel.findById(reservation.offre_id).exec()
                : reservation.offre_id;
            if (offre && typeof offre !== 'string' && offre.reduction) {
                remise = (offre.reduction / 100) * reservation.prix_total;
            }
        }
        console.log('Préparation des données PDF pour la facture:', factureId);
        const invoiceData = {
            numero: facture._id.toString().slice(-6).toUpperCase(),
            date_emission: facture.date_emission,
            date_echeance: facture.date_echeance,
            client: {
                nom: userData.nom,
                prenom: userData.prenom,
                email: userData.email,
                telephone: 'Non renseigné',
                adresse: 'Non renseignée',
            },
            voiture: voitureData,
            reservation: {
                date_debut: reservation.date_debut,
                date_fin: reservation.date_fin,
            },
            location: {
                km_depart: location.km_depart,
                km_retour: location.km_retour || 0,
            },
            cout_base: reservation.prix_total,
            remise: remise,
            frais_supplementaires: location.frais_supplementaires || 0,
            montant_total: facture.montant_total,
            notes: facture.notes || '',
            paiements: [],
            Fields: { remise: remise }
        };
        console.log('Génération du PDF avec les données:', JSON.stringify(invoiceData, null, 2));
        try {
            const pdfPath = await this.pdfService.generateInvoice(invoiceData);
            console.log('PDF généré avec succès:', pdfPath);
            return pdfPath;
        }
        catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            throw new Error(`Impossible de générer le PDF: ${error.message}`);
        }
    }
    async sendInvoiceByEmail(factureId, customEmail) {
        const pdfPath = await this.generateInvoicePdf(factureId);
        const { facture } = await this.getInvoiceById(factureId);
        const reservation = await this.reservationModel.findById(facture.reservation_id)
            .populate('utilisateur_id')
            .exec();
        let email;
        if (customEmail) {
            email = customEmail;
        }
        else if (typeof reservation?.utilisateur_id !== 'string' && reservation?.utilisateur_id?.email) {
            email = reservation.utilisateur_id.email;
        }
        else {
            throw new common_1.BadRequestException('Aucune adresse email disponible. Veuillez fournir une adresse email.');
        }
        try {
            console.log(`Tentative d'envoi d'email à ${email}`);
            await this.mailService.sendInvoiceEmail(email, 'Votre facture de location NDAMAAR', `Cher client,\n\nVeuillez trouver ci-joint votre facture pour votre récente location de véhicule.\n\nMontant total : ${facture.montant_total} FCFA\nDate d'échéance : ${new Date(facture.date_echeance).toLocaleDateString()}\n\nMerci de votre confiance.\n\nL'équipe NDAMAAR`, pdfPath);
            return { message: `Email envoyé avec succès à ${email}` };
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            throw new Error(`Impossible d'envoyer l'email: ${error.message}`);
        }
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(location_schema_1.LocationContrat.name)),
    __param(1, (0, mongoose_1.InjectModel)(reservation_schema_1.Reservation.name)),
    __param(2, (0, mongoose_1.InjectModel)(voiture_schema_1.Voiture.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(facture_schema_1.Facture.name)),
    __param(5, (0, mongoose_1.InjectModel)(paiement_schema_1.Paiement.name)),
    __param(6, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __param(7, (0, mongoose_1.InjectModel)(offre_schema_1.Offre.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService,
        pdf_service_1.PdfService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map