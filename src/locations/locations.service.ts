// src/locations/locations.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LocationContrat,
  LocationContratDocument,
} from '../schemas/location.schema';
import {
  Reservation,
  ReservationDocument,
} from '../schemas/reservation.schema';
import { Voiture, VoitureDocument } from '../schemas/voiture.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Facture, FactureDocument } from '../schemas/facture.schema';
import { Paiement, PaiementDocument } from '../schemas/paiement.schema';
import { Client, ClientDocument } from '../schemas/client.schema';
import { Offre, OffreDocument } from '../schemas/offre.schema';
import { StartContractDto } from './dto/start-contract.dto';
import { EndContractDto } from './dto/end-contract.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { MailService } from './mail.service';
import { PdfService } from './pdf.service';
import { ObjectId } from 'mongoose';
@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(LocationContrat.name)
    private locationModel: Model<LocationContratDocument>,
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Voiture.name) private voitureModel: Model<VoitureDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Facture.name) private factureModel: Model<FactureDocument>,
    @InjectModel(Paiement.name) private paiementModel: Model<PaiementDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Offre.name) private offreModel: Model<OffreDocument>,
    private mailService: MailService,
    private pdfService: PdfService,
  ) {}

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

  async getLocationById(id: string) {
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
      throw new NotFoundException(
        `Contrat de location avec l'ID ${id} non trouvé`,
      );
    }

    return location;
  }

  async startContract(startContractDto: StartContractDto) {
    // Vérifier que la réservation existe et est confirmée
    const reservation = await this.reservationModel
      .findById(startContractDto.reservation_id)
      .populate('voiture_id')
      .populate('utilisateur_id')
      .exec();

    if (!reservation) {
      throw new NotFoundException(
        `Réservation avec l'ID ${startContractDto.reservation_id} non trouvée`,
      );
    }

    if (reservation.statut !== 'confirmee') {
      throw new BadRequestException('Seules les réservations confirmées peuvent devenir des contrats de location');
    }

    // Vérifier si un contrat existe déjà pour cette réservation
    const existingContract = await this.locationModel.findOne({ 
      reservation_id: startContractDto.reservation_id 
    }).exec();

    if (existingContract) {
      throw new BadRequestException('Un contrat de location existe déjà pour cette réservation');
    }

    // Créer le contrat de location
    const newLocation = new this.locationModel({
      reservation_id: startContractDto.reservation_id,
      date_debut_reelle: new Date(),
      km_depart: startContractDto.km_depart,
      etat_depart: startContractDto.etat_depart,
      statut: 'en_cours',
    });

    const savedLocation = await newLocation.save();

    // Mettre à jour le statut de la voiture
    const voitureId = typeof reservation.voiture_id === 'string' 
      ? reservation.voiture_id 
      : (reservation.voiture_id as any)._id;
    
    await this.voitureModel.findByIdAndUpdate(voitureId, { disponibilite: false });

    return savedLocation;
  }

  async endContract(id: string, endContractDto: EndContractDto) {
    const location = await this.locationModel.findById(id).populate({
      path: 'reservation_id',
      populate: [
        { path: 'utilisateur_id' },
        { path: 'voiture_id' },
        { path: 'offre_id' },
      ],
    }).exec();

    if (!location) {
      throw new NotFoundException(`Contrat de location avec l'ID ${id} non trouvé`);
    }

    if (location.statut !== 'en_cours') {
      throw new BadRequestException('Ce contrat de location est déjà terminé ou en retard');
    }

    // Mettre à jour les informations de retour
    location.date_fin_reelle = new Date();
    location.km_retour = endContractDto.km_retour;
    location.etat_retour = endContractDto.etat_retour;
    location.frais_supplementaires = endContractDto.frais_supplementaires || 0;
    location.statut = 'terminee';

    const updatedLocation = await location.save();

    // Mettre à jour le statut de la réservation
    const reservationId = typeof location.reservation_id === 'string'
      ? location.reservation_id
      : (location.reservation_id as any)._id;
    
    await this.reservationModel.findByIdAndUpdate(reservationId, { statut: 'terminee' });

    // Mettre à jour le statut de la voiture
    const reservation = await this.reservationModel.findById(reservationId).populate('voiture_id').exec();
    if (reservation) {
      const voitureId = typeof reservation.voiture_id === 'string'
        ? reservation.voiture_id
        : (reservation.voiture_id as any)._id;
      
      await this.voitureModel.findByIdAndUpdate(voitureId, { disponibilite: true });
    }

    // Générer la facture
    const facture = await this.generateInvoice(updatedLocation);

    return {
      location: updatedLocation,
      facture,
    };
  }
  // Dans locations.service.ts - Ajouter cette méthode
  async createTestInvoice(testData: {
    reservation_id: string;
    client_id: string;
    montant_total?: number;
  }) {
    // Vérifier que la réservation existe
    const reservation = await this.reservationModel.findById(testData.reservation_id).exec();
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${testData.reservation_id} non trouvée`);
    }

    // Vérifier que le client existe
    const client = await this.clientModel.findById(testData.client_id).exec();
    if (!client) {
      throw new NotFoundException(`Client avec l'ID ${testData.client_id} non trouvé`);
    }

    // Créer une facture de test
    const nouvelleFacture = new this.factureModel({
      reservation_id: testData.reservation_id,
      client_id: testData.client_id,
      date_emission: new Date(),
      date_echeance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      montant_total: testData.montant_total || 50000,
      notes: "Facture de test",
      statut: 'en_attente',
    });

    // Sauvegarder la facture
    const factureEnregistree = await nouvelleFacture.save();
    return factureEnregistree;
  }
  async generateInvoice(location: LocationContratDocument) {
    const reservation = await this.reservationModel
      .findById(location.reservation_id)
      .populate('utilisateur_id')
      .populate('voiture_id')
      .populate('offre_id')
      .exec();

    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${location.reservation_id} non trouvée`);
    }
    if (!reservation.utilisateur_id) {
        console.log("Attention : utilisateur_id est null pour la réservation", reservation._id);
        
        // Créer une facture sans client
        const nouvelleFacture = new this.factureModel({
          reservation_id: reservation._id,
          client_id: null, // Pas de client associé
          date_emission: new Date(),
          date_echeance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          montant_total: reservation.prix_total + (location.frais_supplementaires || 0),
          notes: location.frais_supplementaires
            ? `Frais supplémentaires ajoutés : ${location.frais_supplementaires} FCFA`
            : '',
          statut: 'en_attente',
        });
        const factureEnregistree = await nouvelleFacture.save();

      // Retourner la facture sans générer de PDF ni envoyer d'email
      return factureEnregistree;
    }

    // Obtenir l'ID de l'utilisateur de manière sûre
    // Solution pragmatique avec cast explicite
    let userId: string;
    try {
      if (typeof reservation.utilisateur_id === 'string') {
        userId = reservation.utilisateur_id;
      } else {
        // @ts-ignore - Ignorer les erreurs TypeScript pour cette ligne
        userId = reservation.utilisateur_id._id.toString();
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'ID utilisateur:', error);
      console.log('Réservation:', reservation);
      console.log('Utilisateur ID:', reservation.utilisateur_id);
    throw new BadRequestException('ID utilisateur non trouvé dans la réservation');
    }

    // Trouver le client
    const client = await this.clientModel
      .findOne({ utilisateur_id: userId })
      .exec();

    // Calcul du montant total
    const montantTotal =
      reservation.prix_total + (location.frais_supplementaires || 0);

    // Créer la facture
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
  
    // Extraire les données utilisateur de manière sûre
    const userData = {
      nom: '',
      prenom: '',
      email: ''
    };
  
    if (typeof reservation.utilisateur_id !== 'string') {
      const user = reservation.utilisateur_id as Record<string, any>;
      userData.nom = user.nom || '';
      userData.prenom = user.prenom || '';
      userData.email = user.email || '';
    }

    // Extraire les données voiture de manière sûre
    const voitureData = {
      marque: typeof reservation.voiture_id === 'string' ? 'N/A' : 
            (reservation.voiture_id as Record<string, any>).marque || 'N/A',
      modele: typeof reservation.voiture_id === 'string' ? 'N/A' : 
            (reservation.voiture_id as Record<string, any>).modele || 'N/A',
      annee: typeof reservation.voiture_id === 'string' ? 0 : 
            (reservation.voiture_id as Record<string, any>).annee || 0,
      prix_location: typeof reservation.voiture_id === 'string' ? 0 : 
            (reservation.voiture_id as Record<string, any>).prix_location || 0
    };

    // Calculer la remise
    let remise = 0;
    if (reservation.offre_id) {
      let offre: Record<string, any> | null = null;

      if (typeof reservation.offre_id === 'string') {
        offre = await this.offreModel.findById(reservation.offre_id).exec() as unknown as Record<string, any>;
      } else {
        offre = reservation.offre_id as Record<string, any>;
      }

      if (offre && 'reduction' in offre) {
        remise = (offre.reduction / 100) * reservation.prix_total;
      }
    }
  
    // Préparer les données pour la facture PDF
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
      Fields: { remise }, // Fields contient la remise
      frais_supplementaires: location.frais_supplementaires || 0,
      paiements: [], // Tableau vide pour les paiements
    };
  
    // Générer le PDF
    try {
      const pdfPath = await this.pdfService.generateInvoice(invoiceData);
  
      // Envoyer l'email avec la facture
      if (userData.email) {
        try {
          await this.mailService.sendInvoiceEmail(
            userData.email,
            'Votre facture de location NDAMAAR',
            `Cher(e) ${userData.prenom} ${userData.nom},\n\nVeuillez trouver ci-joint votre facture pour votre récente location de véhicule.\n\nMontant total : ${montantTotal} FCFA\nDate d'échéance : ${new Date(factureEnregistree.date_echeance).toLocaleDateString()}\n\nMerci de votre confiance.\n\nL'équipe NDAMAAR`,
            pdfPath,
          );
        } catch (error) {
          console.error("Erreur lors de l'envoi de l'email :", error);
          // On continue même si l'email échoue
        }
      }

      return factureEnregistree;
    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
      // Si le PDF échoue, on retourne quand même la facture
      return factureEnregistree;
    }
  }

  async createPayment(reservationId: string, createPaymentDto: CreatePaymentDto) {
    // Vérifier que la facture existe
    const facture = await this.factureModel.findById(createPaymentDto.facture_id).exec();

    if (!facture) {
      throw new NotFoundException(`Facture avec l'ID ${createPaymentDto.facture_id} non trouvée`);
    }

    // Vérifier que la facture correspond à la réservation
    if (facture.reservation_id.toString() !== reservationId) {
      throw new BadRequestException('Cette facture ne correspond pas à la réservation spécifiée');
    }

    // Créer le paiement
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

    // Si le paiement est validé et couvre le montant total, mettre à jour le statut de la facture
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

  async getInvoices(clientId?: string) {
    let query = {};

    if (clientId) {
      const client = await this.clientModel.findOne({ utilisateur_id: clientId }).exec();
      if (!client) {
        throw new NotFoundException(`Client avec l'ID ${clientId} non trouvé`);
      }
      query = { client_id: client._id };
    }

    return this.factureModel
      .find(query)
      .populate('reservation_id')
      .populate('client_id')
      .exec();
  }

  async getInvoiceById(id: string) {
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
      throw new NotFoundException(`Facture avec l'ID ${id} non trouvée`);
    }

    // Récupérer les paiements liés à cette facture
    const paiements = await this.paiementModel.find({ facture_id: id }).exec();

    return {
      facture,
      paiements,
    };
  }

  async getPayments(factureId?: string) {
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

  // Dans locations.service.ts - Ajouter cette nouvelle méthode
  async generateInvoicePdf(factureId: string): Promise<string> {
    // Récupérer les données de la facture
    const { facture } = await this.getInvoiceById(factureId);

    // Récupérer les informations liées
    const reservation = await this.reservationModel.findById(facture.reservation_id)
      .populate('utilisateur_id')
      .populate('voiture_id')
      .populate('offre_id')
      .exec();

    const location = await this.locationModel.findOne({ reservation_id: facture.reservation_id }).exec();
    
    if (!reservation || !location) {
      throw new NotFoundException(`Données incomplètes pour la facture ${factureId}`);
    }
    
    // Extraire les données utilisateur
    const userData = typeof reservation.utilisateur_id === 'string'
      ? { nom: 'Client', prenom: '', email: '' }
      : {
          nom: (reservation.utilisateur_id as any).nom || '',
          prenom: (reservation.utilisateur_id as any).prenom || '',
          email: (reservation.utilisateur_id as any).email || ''
        };
  
    // Extraire les données voiture
    const voitureData = typeof reservation.voiture_id === 'string'
      ? { marque: 'N/A', modele: 'N/A', annee: 0 }
      : reservation.voiture_id;
  
    // Calculer la remise
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

    // Préparer les données pour la facture PDF
    const invoiceData = {
      numero: (facture._id as string).toString().slice(-6).toUpperCase(),
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
      paiements: [],  // Vous pourriez ajouter les paiements si nécessaire
      Fields: { remise: remise }  // Pour correspondre à votre interface
    };
    
    console.log('Génération du PDF avec les données:', JSON.stringify(invoiceData, null, 2));
    
    // Générer le PDF
    try {
      const pdfPath = await this.pdfService.generateInvoice(invoiceData);
      console.log('PDF généré avec succès:', pdfPath);
      return pdfPath;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error(`Impossible de générer le PDF: ${error.message}`);
    }
  }

  // Dans locations.service.ts - Ajouter cette nouvelle méthode
async sendInvoiceByEmail(factureId: string, customEmail?: string): Promise<{ message: string }> {
    // Générer d'abord le PDF
    const pdfPath = await this.generateInvoicePdf(factureId);
    
    // Récupérer les informations de la facture
    const { facture } = await this.getInvoiceById(factureId);
    const reservation = await this.reservationModel.findById(facture.reservation_id)
      .populate('utilisateur_id')
      .exec();
    
    // Déterminer l'adresse email
    let email: string;
    if (customEmail) {
      email = customEmail;
    } else if (typeof reservation?.utilisateur_id !== 'string' && reservation?.utilisateur_id?.email) {
      email = (reservation.utilisateur_id as any).email;
    } else {
      throw new BadRequestException('Aucune adresse email disponible. Veuillez fournir une adresse email.');
    }
    
    try {
      console.log(`Tentative d'envoi d'email à ${email}`);
      
      await this.mailService.sendInvoiceEmail(
        email,
        'Votre facture de location NDAMAAR',
        `Cher client,\n\nVeuillez trouver ci-joint votre facture pour votre récente location de véhicule.\n\nMontant total : ${facture.montant_total} FCFA\nDate d'échéance : ${new Date(facture.date_echeance).toLocaleDateString()}\n\nMerci de votre confiance.\n\nL'équipe NDAMAAR`,
        pdfPath
      );
      
      return { message: `Email envoyé avec succès à ${email}` };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error(`Impossible d'envoyer l'email: ${error.message}`);
    }
  }
}
