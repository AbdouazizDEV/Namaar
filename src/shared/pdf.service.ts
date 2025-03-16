// src/shared/pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class PdfService {
  private readonly uploadDir: string;

  constructor() {
    // Créer le répertoire de sortie s'il n'existe pas
    this.uploadDir = join(process.cwd(), 'uploads', 'pdfs');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async generateReservationConfirmation(reservation: any): Promise<string> {
    const filename = `confirmation-reservation-${reservation._id}-${Date.now()}.pdf`;
    const filePath = join(this.uploadDir, filename);
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // En-tête
        doc
          .fontSize(25)
          .text('Confirmation de Réservation', { align: 'center' });
        doc.moveDown();

        // Informations de la réservation
        doc.fontSize(14).text(`Numéro de réservation: ${reservation._id}`);
        doc.moveDown();

        doc
          .fontSize(12)
          .text(
            `Date de réservation: ${this.formatDate(reservation.date_reservation)}`,
          );
        doc.text(`Client: ${this.getClientName(reservation.utilisateur_id)}`);
        doc.moveDown();

        // Détails du véhicule (avec vérification)
        const vehicule = reservation.voiture_id || {};
        doc.fontSize(14).text('Détails du véhicule:');
        doc.fontSize(12).text(`Marque: ${vehicule.marque || 'N/A'}`);
        doc.text(`Modèle: ${vehicule.modele || 'N/A'}`);
        doc.text(`Immatriculation: ${vehicule.immatriculation || 'N/A'}`);
        doc.moveDown();

        // Dates de location
        doc.fontSize(14).text('Période de location:');
        doc.fontSize(12).text(`Du: ${this.formatDate(reservation.date_debut)}`);
        doc.text(`Au: ${this.formatDate(reservation.date_fin)}`);
        doc.moveDown();
        
        // Options supplémentaires
        if (reservation.options && reservation.options.length > 0) {
          doc.fontSize(14).text('Options supplémentaires:');
          reservation.options.forEach(option => {
            doc.fontSize(12).text(`- ${option.nom || 'Option'}: ${option.prix || 0} €`);
          });
          doc.moveDown();
        }
        
        // Prix total
        const prixTotal = reservation.prix_total || 0;
        doc.fontSize(14).text(`Prix total: ${prixTotal.toFixed(2)} €`, { align: 'right' });
        doc.moveDown();
        
        // Statut de la réservation
        doc.fontSize(14).text(`Statut: ${this.getStatusLabel(reservation.statut)}`);
        doc.moveDown();
        
        // Instructions et conditions
        doc.fontSize(14).text('Instructions:');
        doc.fontSize(10).text('Veuillez présenter ce document lors de la prise en charge du véhicule.');
        doc.text('Une pièce d\'identité et un permis de conduire valide seront demandés.');
        doc.moveDown();
        
        doc.fontSize(14).text('Conditions d\'annulation:');
        doc.fontSize(10).text('- Annulation gratuite jusqu\'à 48h avant la date de début de location');
        doc.text('- Annulation à moins de 48h: 20% de frais d\'annulation');
        doc.text('- Non-présentation: aucun remboursement');
        doc.moveDown(2);
        
        // Pied de page
        doc.fontSize(10).text('NDAMAAR Location de véhicules', { align: 'center' });
        doc.text('Confirmation générée le ' + this.formatDate(new Date()), { align: 'center' });
        
        doc.end();
        
        stream.on('finish', () => {
          resolve(filePath);
        });
        
        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateInvoice(data: any, facture: any): Promise<string> {
    // Utiliser data au lieu de reservation pour éviter la confusion
    const filename = `facture-${data.numero || 'temp'}-${Date.now()}.pdf`;
    const filePath = join(this.uploadDir, filename);
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        
        doc.pipe(stream);
        
        // En-tête
        doc.fontSize(25).text('Facture', { align: 'center' });
        doc.moveDown();
        
        // Informations de la facture
        doc.fontSize(14).text(`Numéro de facture: ${data.numero || 'N/A'}`);
        doc.text(`Date d'émission: ${this.formatDate(data.date_emission || new Date())}`);
        doc.text(`Date d'échéance: ${this.formatDate(data.date_echeance || new Date())}`);
        doc.moveDown();
        
        // Informations du client
        const client = data.client || {};
        doc.fontSize(14).text('Informations client:');
        doc.fontSize(12).text(`Client: ${client.prenom || ''} ${client.nom || ''}`);
        if (client.email) doc.text(`Email: ${client.email}`);
        if (client.telephone) doc.text(`Téléphone: ${client.telephone}`);
        if (client.adresse) doc.text(`Adresse: ${client.adresse}`);
        doc.moveDown();
        
        // Détails de la réservation
        const reservation = data.reservation || {};
        doc.fontSize(14).text('Détails de la réservation:');
        doc.fontSize(12).text(`Numéro de réservation: ${data.numero?.replace('FACT-', '') || 'N/A'}`);
        doc.text(`Période: du ${this.formatDate(reservation.date_debut || new Date())} au ${this.formatDate(reservation.date_fin || new Date())}`);
        doc.moveDown();
        
        // Détails du véhicule
        const vehicule = data.voiture || {};
        doc.fontSize(14).text('Véhicule:');
        doc.fontSize(12).text(`${vehicule.marque || 'N/A'} ${vehicule.modele || 'N/A'} (${vehicule.annee || 'N/A'})`);
        doc.moveDown();
        
        // Tableau des prestations
        doc.fontSize(14).text('Détail des prestations:', { underline: true });
        doc.moveDown();
        
        // Calculer le nombre de jours - utiliser une valeur par défaut si dates invalides
        const nbJours = this.calculateDays(
          reservation.date_debut || new Date(),
          reservation.date_fin || new Date()
        ) || 1;
        
        // Vérifier que le prix_location est défini
        const prixJournalier = vehicule.prix_location || data.cout_base / nbJours || 0;
        
        // Location du véhicule (prestation de base)
        doc.fontSize(12).text(`Location véhicule (${nbJours} jours x ${prixJournalier.toFixed(2)} €)`, { width: 350, continued: true });
        doc.text(`${(nbJours * prixJournalier).toFixed(2)} €`, { align: 'right' });
        
        // Options supplémentaires (si présentes dans les données)
        let totalOptions = 0;
        const options = data.options || [];
        if (options.length > 0) {
          options.forEach(option => {
            const prixOption = option.prix || 0;
            totalOptions += prixOption;
            doc.text(`${option.nom || 'Option'} (${nbJours} jours)`, { width: 350, continued: true });
            doc.text(`${prixOption.toFixed(2)} €`, { align: 'right' });
          });
        }
        
        // Remises éventuelles
        let remise = data.Fields?.remise || 0;
        if (remise > 0) {
          doc.text(`Remise`, { width: 350, continued: true });
          doc.text(`-${remise.toFixed(2)} €`, { align: 'right' });
        }
        
        doc.moveDown();
        
        // Sous-total HT (considérons un taux de TVA de 20%)
        const sousTotal = data.cout_base || 0;
        const tva = sousTotal * 0.2;
        const total = data.montant_total || sousTotal + tva;
        
        doc.text('Sous-total HT:', { width: 350, continued: true });
        doc.text(`${sousTotal.toFixed(2)} €`, { align: 'right' });
        
        doc.text('TVA (20%):', { width: 350, continued: true });
        doc.text(`${tva.toFixed(2)} €`, { align: 'right' });
        
        doc.moveDown();
        
        // Total TTC
        doc.fontSize(14).text('Total TTC:', { width: 350, continued: true });
        doc.text(`${total.toFixed(2)} €`, { align: 'right' });
        
        doc.moveDown(2);
        
        // Statut de paiement
        const factureStatus = facture.statut || 'en_attente';
        doc.fontSize(14).text(`Statut: ${this.getInvoiceStatus(factureStatus)}`);
        if (factureStatus === 'payée') {
          doc.fontSize(12).text('Cette facture a été entièrement réglée. Nous vous remercions de votre confiance.');
        } else if (factureStatus === 'en_attente') {
          doc.fontSize(12).text(`Merci de bien vouloir régler cette facture avant le ${this.formatDate(data.date_echeance || new Date())}.`);
          doc.text('Moyens de paiement acceptés: Carte bancaire, virement, PayPal.');
        }
        
        // Notes (si présentes)
        if (data.notes) {
          doc.moveDown();
          doc.fontSize(12).text('Notes:', { underline: true });
          doc.fontSize(10).text(data.notes);
        }
        
        doc.moveDown(2);
        
        // Pied de page
        doc.fontSize(10).text('NDAMAAR Location de véhicules', { align: 'center' });
        doc.text('SIRET: 123 456 789 00012 - TVA: FR12 123456789', { align: 'center' });
        doc.text('123 Avenue de la République, 75011 Paris', { align: 'center' });
        doc.text('contact@ndamaar.com - 01 23 45 67 89', { align: 'center' });
        
        doc.end();
        
        stream.on('finish', () => {
          resolve(filePath);
        });
        
        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private formatDate(dateString: Date | string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  private calculateDays(dateDebut: Date | string, dateFin: Date | string): number {
    try {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      const diffTime = fin.getTime() - debut.getTime();
      return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch (error) {
      return 1; // valeur par défaut en cas d'erreur
    }
  }

  private getClientName(utilisateur: any): string {
    if (!utilisateur) return 'Client';
    
    if (typeof utilisateur === 'string') return 'Client';
    
    if (utilisateur.prenom && utilisateur.nom) {
      return `${utilisateur.prenom} ${utilisateur.nom}`;
    } else if (utilisateur.nom_complet) {
      return utilisateur.nom_complet;
    } else if (utilisateur.email) {
      return utilisateur.email;
    }
    
    return 'Client';
  }

  private getStatusLabel(status: string): string {
    const statusMap = {
      'en_attente': 'En attente de confirmation',
      'confirmee': 'Confirmée',
      'annulee': 'Annulée',
      'terminee': 'Terminée'
    };
    
    return statusMap[status] || status;
  }

  private getInvoiceStatus(status: string): string {
    const statusMap = {
      'en_attente': 'En attente de paiement',
      'payée': 'Payée',
      'annulée': 'Annulée'
    };
    
    return statusMap[status] || status;
  }
}
