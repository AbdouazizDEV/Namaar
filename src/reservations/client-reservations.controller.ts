// src/reservations/client-reservations.controller.ts
import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Query,
  Header,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationsService } from './reservations.service';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PaymentService } from './payment.service';
import { Response } from 'express';
import { PdfService } from '../shared/pdf.service';
import { MailService } from '../locations/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../schemas/client.schema';
import { UserDocument } from '../schemas/user.schema';
import { ReservationDocument } from '../schemas/reservation.schema';
import { Voiture, VoitureDocument } from '../schemas/voiture.schema';

interface RemboursementInfo {
  montant_initial: number;
  frais_annulation: number;
  montant_rembourse: number;
  date_remboursement: Date;
}

@Controller('client/reservations')
@UseGuards(JwtAuthGuard)
export class ClientReservationsController {
  // Dans le constructeur de ClientReservationsController
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly paymentService: PaymentService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Voiture.name) private voitureModel: Model<VoitureDocument>,
  ) {}

  // Liste des réservations du client (passées et à venir)
  @Get()
  async getClientReservations(
    @Request() req,
    @Query('status') status?: string,
  ) {
    // Récupère toutes les réservations de l'utilisateur
    const allReservations = await this.reservationsService.getUserReservations(req.user._id);

    if (!status) {
      return allReservations;
    }

    const now = new Date();

    // Filtre selon le paramètre status
    if (status === 'upcoming') {
      // Réservations à venir : date de début dans le futur ou date de fin dans le futur
      return allReservations.filter(res => new Date(res.date_fin) >= now);
    } else if (status === 'past') {
      // Réservations passées : date de fin dans le passé
      return allReservations.filter(res => new Date(res.date_fin) < now);
    } else if (['en_attente', 'confirmee', 'annulee', 'terminee'].includes(status)) {
      // Filtre par statut spécifique
      return allReservations.filter(res => res.statut === status);
    }

    return allReservations;
  }

  // Historique complet des locations
  @Get('history')
  async getReservationHistory(@Request() req) {
    const reservations = await this.reservationsService.getUserReservations(
      req.user._id);
    // Trier par date de réservation (la plus récente d'abord)
    return reservations.sort(
      (a, b) =>
        new Date(b.date_reservation).getTime() -
        new Date(a.date_reservation).getTime(),
    );
  }

  // Détails d'une réservation spécifique
  @Get(':id')
  async getReservationDetails(@Param('id') id: string, @Request() req) {
    const reservation = await this.reservationsService.getReservationById(id);
    // Vérifier que l'utilisateur a accès à cette réservation
    const userId = req.user._id.toString();
    const reservationUserId = this.getDocumentId(reservation.utilisateur_id);
    if (userId !== reservationUserId) {
      throw new UnauthorizedException(
        "Vous n'êtes pas autorisé à voir cette réservation",
      );
    }

    return reservation;
  }

  // Modification d'une réservation
  @Put(':id')
  async updateReservation(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @Request() req,
  ) {
    const reservation = await this.reservationsService.getReservationById(id);

    // Vérifier que l'utilisateur a accès à cette réservation
    const userId = req.user._id.toString();
    const reservationUserId = this.getDocumentId(reservation.utilisateur_id);

    if (userId !== reservationUserId) {
      throw new UnauthorizedException(
        "Vous n'êtes pas autorisé à modifier cette réservation",
      );
    }

    // Vérifier que la réservation peut être modifiée (statut en_attente)
    if (reservation.statut !== 'en_attente') {
      throw new BadRequestException(
        'Cette réservation ne peut plus être modifiée car elle a déjà été confirmée, terminée ou annulée',
      );
    }
    // Les clients ne peuvent pas changer certains champs
    delete updateReservationDto.statut;
    return this.reservationsService.updateReservation(id, updateReservationDto);
  }

  // Annulation d'une réservation
  @Put(':id/cancel')
  async cancelReservation(@Param('id') id: string, @Request() req) {
    const reservation = await this.reservationsService.getReservationById(id);

    // Vérifier que l'utilisateur a accès à cette réservation
    const userId = req.user._id.toString();
    const reservationUserId = this.getDocumentId(reservation.utilisateur_id);

    if (userId !== reservationUserId) {
      throw new UnauthorizedException("Vous n'êtes pas autorisé à annuler cette réservation");
    }

    // Vérifier que la réservation peut être annulée
    if (['annulee', 'terminee'].includes(reservation.statut)) {
      throw new BadRequestException("Cette réservation ne peut pas être annulée car elle est déjà terminée ou annulée");
    }

    // Logique d'annulation avec conditions
    const now = new Date();
    const dateDebut = new Date(reservation.date_debut);
    const diffTime = dateDebut.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Si la date de début est dans moins de 48h, appliquer des frais d'annulation
    let fraisAnnulation = 0;
    if (diffDays < 2) {
      fraisAnnulation = reservation.prix_total * 0.2; // 20% de frais
    }
    
    // Si la réservation a déjà été payée, initier un remboursement
    let remboursementInfo: RemboursementInfo | null = null;
    if (reservation.acompte_paye || reservation.statut === 'confirmee') {
      // Chercher la facture associée
      try {
        const facture = await this.paymentService.getReservationInvoice(id);
        
        // Montant à rembourser (montant payé moins frais d'annulation)
        const montantRembourse = Math.max(0, facture.montant_total - fraisAnnulation);
        
        // Logique de remboursement (simulée)
        remboursementInfo = {
          montant_initial: facture.montant_total,
          frais_annulation: fraisAnnulation,
          montant_rembourse: montantRembourse,
          date_remboursement: new Date(),
        };
      } catch (error) {
        // Si pas de facture trouvée, continuer sans remboursement
      }
    }
    
    // Mettre à jour le statut de la réservation
    await this.reservationsService.changeReservationStatus(id, 'annulee');
    
    return {
      message: "Réservation annulée avec succès",
      frais_annulation: fraisAnnulation,
      remboursement: remboursementInfo,
    };
  }

  // Téléchargement de la confirmation de réservation
  @Get(':id/confirmation')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=confirmation.pdf')
  async getReservationConfirmation(@Param('id') id: string, @Request() req, @Res() res: Response) {
    try {
      // Récupérer la réservation avec tous les détails nécessaires
      const reservation = await this.reservationsService.getReservationById(id) as ReservationDocument;

      // Vérifier que la réservation existe
      if (!reservation) {
        throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
      }

      // Vérifier que l'utilisateur a accès à cette réservation
      const userId = req.user._id.toString();
      const reservationUserId = this.getDocumentId(reservation.utilisateur_id);

      if (userId !== reservationUserId) {
        throw new UnauthorizedException("Vous n'êtes pas autorisé à accéder à cette confirmation");
      }

      // Récupérer les infos client depuis la collection Client
      const user = reservation.utilisateur_id as UserDocument;
      const clientInfo = await this.clientModel.findOne({ utilisateur_id: userId });

      // Extraire les informations du véhicule et s'assurer qu'elles sont valides
      const vehicle = reservation.voiture_id;

      // Vérifier que le véhicule est correctement chargé
      if (!vehicle || !vehicle.marque) {
        throw new BadRequestException(`Données du véhicule incomplètes ou manquantes pour la réservation ${id}`);
      }

      // Utiliser PDFKit directement pour créer un PDF
      const PDFDocument = require('pdfkit');
      const fs = require('fs');
      const path = require('path');
      const axios = require('axios');

      // Créer le répertoire d'uploads s'il n'existe pas
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `confirmation-${id}-${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      // Créer un PDF
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

      // Définir des couleurs pour le document
      const primaryColor = '#333333'; // Gris foncé
      const secondaryColor = '#666666'; // Gris moyen
      const accentColor = '#0056b3'; // Bleu accent
      const bgLight = '#f8f9fa'; // Fond clair

      // Télécharger et ajouter le logo
      try {
        const logoUrl = 'https://res.cloudinary.com/dhivn2ahm/image/upload/v1740850713/Grey_and_Black2_Car_Rental_Service_Logo_nrbxc0.png';
        const logoResponse = await axios.get(logoUrl, { responseType: 'arraybuffer' });
        const logoBuffer = Buffer.from(logoResponse.data, 'binary');

        // Ajouter le logo centré en haut
        doc.image(logoBuffer, doc.page.width / 2 - 100, 40, {
          fit: [200, 100],
          align: 'center',
          valign: 'center'
        });

        doc.moveDown(5);
      } catch (logoError) {
        console.error('Erreur lors du chargement du logo:', logoError);
        // Continuer sans logo
        doc.moveDown();
      }

      // En-tête avec style
      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .fillColor(accentColor)
        .text('CONFIRMATION DE RÉSERVATION', { align: 'center' });
      // Ligne décorative
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .strokeColor(accentColor)
         .lineWidth(1.5)
         .stroke();

      doc.moveDown(1);

      // Informations de la réservation
      doc.fontSize(16)
         .fillColor(primaryColor)
         .text(`Numéro de réservation: ${id}`);
      doc.moveDown();

      // Cadre pour les informations client
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
        if (clientInfo.telephone) doc.text(`Téléphone: ${clientInfo.telephone}`, 60, clientBoxY + 60);
        if (clientInfo.adresse) doc.text(`Adresse: ${clientInfo.adresse}`, 300, clientBoxY + 45);
      }
      
      doc.moveDown(5);
      
      // Détails du véhicule avec style
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
      
      if (vehicle.code) doc.text(`Code: ${vehicle.code}`, 300, vehicleBoxY + 30);
      if (vehicle.categorie) doc.text(`Catégorie: ${vehicle.categorie}`, 300, vehicleBoxY + 45);
      
      doc.moveDown(6);
      
      // Dates de location avec style
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
      
      // Options supplémentaires
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
      
      // Prix total avec mise en évidence
      doc.rect(doc.page.width / 2, doc.y, doc.page.width / 2 - 50, 30)
         .fillAndStroke(accentColor, accentColor);
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text(`Prix total: ${reservation.prix_total.toLocaleString()} FCFA`, 
                doc.page.width / 2 + 10, 
                doc.y - 25, 
                { width: doc.page.width / 2 - 70, align: 'right' });
      
      doc.moveDown(2);
      
      // Statut de la réservation avec couleur spécifique
      const statusLabel = {
        'en_attente': 'En attente de confirmation',
        'confirmee': 'Confirmée',
        'annulee': 'Annulée',
        'terminee': 'Terminée'
      };
      
      const statusColor = {
        'en_attente': '#ff9800',  // Orange
        'confirmee': '#4caf50',   // Vert
        'annulee': '#f44336',     // Rouge
        'terminee': '#2196f3'     // Bleu
      };
      
      const statusBoxY = doc.y;
      doc.rect(50, statusBoxY, 200, 30)
         .fillAndStroke(statusColor[reservation.statut] || primaryColor, statusColor[reservation.statut] || primaryColor);
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text(`Statut: ${statusLabel[reservation.statut] || reservation.statut}`, 60, statusBoxY + 8);
      
      // Acompte si applicable
      if (reservation.acompte_paye) {
        doc.moveDown(2);
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor(primaryColor)
           .text(`Acompte payé: ${reservation.montant_acompte.toLocaleString()} FCFA`);
      }
      
      doc.moveDown(2);
      
      // Instructions et conditions avec style
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
      
      // Pied de page avec style
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(secondaryColor);
      
      // Ajouter le pied de page
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
      
      // Attendre que le fichier soit écrit
      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          res.sendFile(filePath);
          resolve(true);
        });
        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Erreur détaillée:', error);
      throw new BadRequestException(`Erreur lors de la génération du PDF: ${error.message}`);
    }
  }

// Téléchargement de la facture
@Get(':id/facture')
@Header('Content-Type', 'application/pdf')
@Header('Content-Disposition', 'attachment; filename=facture.pdf')
async getReservationInvoice(@Param('id') id: string, @Request() req, @Res() res: Response) {
  try {
    // Récupérer la réservation avec tous les détails nécessaires
    const reservation = await this.reservationsService.getReservationById(id) as ReservationDocument;
    
    // Vérifier que la réservation existe
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }
    
    // Vérifier que l'utilisateur a accès à cette réservation
    const userId = req.user._id.toString();
    const reservationUserId = this.getDocumentId(reservation.utilisateur_id);

    if (userId !== reservationUserId) {
      throw new UnauthorizedException("Vous n'êtes pas autorisé à accéder à cette facture");
    }
    
    // Récupérer les infos client depuis la collection Client
    const user = reservation.utilisateur_id as UserDocument;
    const clientInfo = await this.clientModel.findOne({ utilisateur_id: userId });
    
    // Extraire les informations du véhicule et s'assurer qu'elles sont valides
    const vehicle = reservation.voiture_id;
    
    // Vérifier que le véhicule est correctement chargé
    if (!vehicle || !vehicle.marque) {
      // Si le véhicule n'est pas correctement chargé, utiliser des données par défaut
      // au lieu de lever une exception
      console.warn(`Données du véhicule incomplètes pour la réservation ${id}, utilisation de valeurs par défaut`);
    }
    
    // Tenter de récupérer la facture existante ou créer une facture temporaire
    let facture;
    try {
      facture = await this.paymentService.getReservationInvoice(id);
    } catch (error) {
      console.warn(`Aucune facture existante pour la réservation ${id}, création d'une facture temporaire`);
      // Créer une facture temporaire
      facture = {
        date_emission: new Date(),
        date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)),
        montant_total: reservation.prix_total || 0,
        notes: 'Facture temporaire générée automatiquement.'
      };
    }
    
    // Créer un objet qui correspond à l'interface InvoiceData du service PDF
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
    
    // Tenter de récupérer les paiements
    try {
      const paiements = await this.paymentService.getReservationPayments(id);
      if (paiements && paiements.length > 0) {
        // Convertir les paiements au format attendu
        const paiementsFormats = paiements.map(p => ({
          date_paiement: p.date_paiement,
          montant: p.montant,
        }));
        
        // Assigner les paiements formatés
        Object.assign(pdfData, { paiements: paiementsFormats });
      }
    } catch (error) {
      console.log('Aucun paiement trouvé pour cette réservation:', error.message);
    }
    
    // Générer le PDF
    const pdfPath = await this.pdfService.generateInvoice(pdfData, facture);
    
    // Envoyer le fichier au client
    return res.sendFile(pdfPath);
  } catch (error) {
    console.error('Erreur détaillée lors de la génération de la facture:', error);
    if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
      throw error;
    }
    throw new BadRequestException(`Erreur lors de la génération de la facture: ${error.message}`);
  }
}

// Envoi de la facture par email
@Get(':id/send-facture')
async sendInvoiceByEmail(@Param('id') id: string, @Request() req) {
  try {
    // Récupérer la réservation avec tous les détails nécessaires
    const reservation = await this.reservationsService.getReservationById(id) as ReservationDocument;
    
    // Vérifier que la réservation existe
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }
    
    // Vérifier que l'utilisateur a accès à cette réservation
    const userId = req.user._id.toString();
    const reservationUserId = this.getDocumentId(reservation.utilisateur_id);
    
    if (userId !== reservationUserId) {
      throw new UnauthorizedException("Vous n'êtes pas autorisé à demander l'envoi de cette facture");
    }
    
    // Récupérer les infos client depuis la collection Client
    const user = reservation.utilisateur_id as UserDocument;
    if (!user) {
      throw new BadRequestException("Impossible de récupérer les informations utilisateur");
    }
    
    // Vérifier l'email du client
    const clientEmail = user.email;
    if (!clientEmail) {
      throw new BadRequestException("Impossible d'envoyer la facture: adresse email du client manquante");
    }
    
    const clientInfo = await this.clientModel.findOne({ utilisateur_id: userId });
    
    // Extraire les informations du véhicule
    const vehicle = reservation.voiture_id;
    
    // Vérifier que le véhicule est correctement chargé
    if (!vehicle || !vehicle.marque) {
      console.warn(`Données du véhicule incomplètes pour la réservation ${id}, utilisation de valeurs par défaut`);
    }
    
    // Tenter de récupérer la facture existante ou créer une facture temporaire
    let facture;
    try {
      facture = await this.paymentService.getReservationInvoice(id);
    } catch (error) {
      console.warn(`Aucune facture existante pour la réservation ${id}, création d'une facture temporaire`);
      // Créer une facture temporaire
      facture = {
        date_emission: new Date(),
        date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)),
        montant_total: reservation.prix_total || 0,
        notes: 'Facture temporaire générée automatiquement.'
      };
    }
    
    // Créer un objet qui correspond à l'interface InvoiceData du service PDF
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
    
    // Tenter de récupérer les paiements
    try {
      const paiements = await this.paymentService.getReservationPayments(id);
      if (paiements && paiements.length > 0) {
        // Convertir les paiements au format attendu
        const paiementsFormats = paiements.map(p => ({
          date_paiement: p.date_paiement,
          montant: p.montant,
        }));
        
        // Assigner les paiements formatés
        Object.assign(pdfData, { paiements: paiementsFormats });
      }
    } catch (error) {
      console.log('Aucun paiement trouvé pour cette réservation:', error.message);
    }
    
    // Générer le PDF
    const pdfPath = await this.pdfService.generateInvoice(pdfData, facture);
    
    // Envoyer l'email avec la facture en pièce jointe
    await this.mailService.sendInvoiceEmail(
      clientEmail,
      `Votre facture NDAMAAR - Réservation ${id}`,
      `Bonjour ${user.prenom} ${user.nom},\n\nVeuillez trouver ci-joint votre facture pour la réservation de véhicule.\n\nCordialement,\nL'équipe NDAMAAR`,
      pdfPath,
    );

    return {
      success: true,
      message: `Facture envoyée à ${clientEmail}`,
    };
  } catch (error) {
    console.error('Erreur détaillée lors de l\'envoi de la facture:', error);
    if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
      throw error;
    }
    throw new BadRequestException(`Erreur lors de l'envoi de la facture: ${error.message}`);
  }
}

  // Méthode utilitaire pour extraire l'ID d'un document
  private getDocumentId(doc: any): string {
    if (!doc) return '';
    if (typeof doc === 'string') return doc;
    if (doc._id) return doc._id.toString();
    return '';
  }
}
