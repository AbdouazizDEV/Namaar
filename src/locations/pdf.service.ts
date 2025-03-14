import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';

interface InvoiceData {
  numero: string;
  date_emission: Date;
  date_echeance: Date;
  notes?: string;
  Fields: {
    remise?: number;
  };
  client: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    adresse?: string;
  };
  reservation: {
    date_debut: Date;
    date_fin: Date;
  };
  location: {
    km_depart: number;
    km_retour: number;
  };
  voiture: {
    marque: string;
    modele: string;
    annee: number;
    prix_location?: number;
  };
  cout_base: number;
  frais_supplementaires: number;
  montant_total: number;
  paiements: {
    date_paiement: Date;
    montant: number;
  }[];

  // other properties...
}

@Injectable()
export class PdfService {
  // Couleurs pour le style
  private colors = {
    primary: '#333333', // Gris foncé
    secondary: '#666666', // Gris moyen
    accent: '#0066cc', // Bleu
    light: '#f5f5f5', // Gris très clair
    border: '#dddddd', // Gris clair pour les bordures
  };

  async generateInvoice(invoiceData: InvoiceData): Promise<string> {
    console.log('Génération de facture démarrée');
    console.log('Données de facture:', JSON.stringify(invoiceData, null, 2));

    return new Promise(async (resolve, reject) => {
      try {
        // Création du document PDF avec des marges personnalisées
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
          info: {
            Title: `Facture N° ${invoiceData.numero}`,
            Author: 'NDAMAAR',
            Subject: 'Facture de location de véhicule',
          },
        });

        // Préparation du dossier et du fichier
        const uploadsDir = path.join(process.cwd(), 'uploads');
        console.log('Chemin du dossier uploads:', uploadsDir);
        fs.ensureDirSync(uploadsDir);

        const fileName = `facture-${invoiceData.numero}.pdf`;
        const filePath = path.join(uploadsDir, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Téléchargement et ajout du logo
        const logoUrl =
          'https://res.cloudinary.com/dhivn2ahm/image/upload/v1740850713/Grey_and_Black2_Car_Rental_Service_Logo_nrbxc0.png';
        try {
          const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
          const logoBuffer = Buffer.from(response.data, 'binary');

          // Ajout du logo en haut au centre, avec une taille contrôlée
          doc.image(logoBuffer, (doc.page.width - 100) / 2, 20, { width: 100 });
          doc.moveDown(4); // Espace supplémentaire après le logo
        } catch (error) {
          console.error('Erreur lors du téléchargement du logo:', error);
          // Continuer sans logo si le téléchargement échoue
          doc.fontSize(24).text('NDAMAAR', { align: 'center' });
          doc.moveDown(2);
        }

        // Titre de la facture avec style amélioré
        doc
          .font('Helvetica-Bold')
          .fontSize(18)
          .fillColor(this.colors.accent)
          .text('FACTURE DE LOCATION DE VÉHICULE', { align: 'center' });

        doc.moveDown(1.5);

        // Rectangle d'information de facture avec fond coloré
        const infoBoxY = doc.y;
        doc
          .rect(50, infoBoxY, doc.page.width - 100, 70)
          .fillAndStroke(this.colors.light, this.colors.border);

        // Informations de la facture dans le rectangle
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(this.colors.primary)
          .text(`Facture N° : ${invoiceData.numero}`, 70, infoBoxY + 15);

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(this.colors.secondary)
          .text(
            `Date d'émission : ${new Date(invoiceData.date_emission).toLocaleDateString()}`,
            70,
            infoBoxY + 35,
          );

        doc.text(
          `Date d'échéance : ${new Date(invoiceData.date_echeance).toLocaleDateString()}`,
          70,
          infoBoxY + 55,
        );

        // Disposition en deux colonnes pour les informations client et véhicule
        doc.moveDown(3);
        const columnWidth = (doc.page.width - 100) / 2;
        const leftColumn = 50;
        const rightColumn = leftColumn + columnWidth;
        const startY = doc.y;

        // Colonne gauche - Informations client
        this.drawSectionTitle(doc, 'INFORMATIONS CLIENT', leftColumn, startY);
        const clientInfoY = startY + 25;

        doc.font('Helvetica-Bold')
           .fontSize(10)
           .fillColor(this.colors.secondary)
           .text('Client:', leftColumn, clientInfoY);
        
        doc.font('Helvetica')
           .text(`${invoiceData.client.nom} ${invoiceData.client.prenom}`, leftColumn + 60, clientInfoY);
        
        doc.font('Helvetica-Bold')
           .text('Email:', leftColumn, clientInfoY + 20);
        
        doc.font('Helvetica')
           .text(invoiceData.client.email, leftColumn + 60, clientInfoY + 20);
        
        doc.font('Helvetica-Bold')
           .text('Téléphone:', leftColumn, clientInfoY + 40);
        
        doc.font('Helvetica')
           .text(invoiceData.client.telephone || 'Non renseigné', leftColumn + 60, clientInfoY + 40);
        
        doc.font('Helvetica-Bold')
           .text('Adresse:', leftColumn, clientInfoY + 60);
        
        doc.font('Helvetica')
           .text(invoiceData.client.adresse || 'Non renseignée', leftColumn + 60, clientInfoY + 60);

        // Colonne droite - Détails de la location
        this.drawSectionTitle(doc, 'DÉTAILS DE LA LOCATION', rightColumn, startY);
        
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .fillColor(this.colors.secondary)
           .text('Véhicule:', rightColumn, clientInfoY);
        
        doc.font('Helvetica')
           .text(`${invoiceData.voiture.marque} ${invoiceData.voiture.modele} (${invoiceData.voiture.annee})`, rightColumn + 60, clientInfoY);
        
        doc.font('Helvetica-Bold')
           .text('Période:', rightColumn, clientInfoY + 20);
        
        doc.font('Helvetica')
           .text(`Du ${new Date(invoiceData.reservation.date_debut).toLocaleDateString()} au ${new Date(invoiceData.reservation.date_fin).toLocaleDateString()}`, rightColumn + 60, clientInfoY + 20);
        
        doc.font('Helvetica-Bold')
           .text('Km départ:', rightColumn, clientInfoY + 40);
        
        doc.font('Helvetica')
           .text(`${invoiceData.location.km_depart} km`, rightColumn + 60, clientInfoY + 40);

        if (invoiceData.location.km_retour) {
          doc.font('Helvetica-Bold')
             .text('Km retour:', rightColumn, clientInfoY + 60);
          
          doc.font('Helvetica')
             .text(`${invoiceData.location.km_retour} km`, rightColumn + 60, clientInfoY + 60);
          
          doc.font('Helvetica-Bold')
             .text('Distance:', rightColumn, clientInfoY + 80);
          
          doc.font('Helvetica')
             .text(`${invoiceData.location.km_retour - invoiceData.location.km_depart} km`, rightColumn + 60, clientInfoY + 80);
        }

        // Tableau des coûts
        doc.moveDown(8);
        this.drawSectionTitle(doc, 'RÉCAPITULATIF DES COÛTS', 50, doc.y);
        doc.moveDown(1);

        const tableTop = doc.y;
        const tableWidth = doc.page.width - 100;
        const descriptionWidth = tableWidth * 0.7;
        const amountWidth = tableWidth * 0.3;

        // En-tête du tableau
        doc.rect(50, tableTop, tableWidth, 25)
           .fillAndStroke(this.colors.accent, this.colors.accent);
        
        doc.fillColor('white')
           .font('Helvetica-Bold')
           .fontSize(10)
           .text('DESCRIPTION', 60, tableTop + 8);
        
        doc.text('MONTANT', 50 + descriptionWidth + 10, tableTop + 8, { align: 'right' });

        // Lignes du tableau
        let rowY = tableTop + 25;

        // Ligne 1: Coût de base
        this.drawTableRow(doc, rowY, 'Location de base', `${invoiceData.cout_base.toFixed(2)} FCFA`);
        rowY += 25;

        // Ligne 2: Remise (si applicable)
        if (invoiceData.Fields?.remise) {
          this.drawTableRow(doc, rowY, 'Remise', `-${invoiceData.Fields.remise.toFixed(2)} FCFA`);
          rowY += 25;
        }

        // Ligne 3: Frais supplémentaires
        if (invoiceData.frais_supplementaires) {
          this.drawTableRow(doc, rowY, 'Frais supplémentaires', `${invoiceData.frais_supplementaires.toFixed(2)} FCFA`);
          rowY += 25;
        }

        // Ligne de total avec fond différent
        doc.rect(50, rowY, tableWidth, 30)
           .fillAndStroke(this.colors.light, this.colors.border);
        
        doc.fillColor(this.colors.primary)
           .font('Helvetica-Bold')
           .fontSize(12)
           .text('TOTAL', 60, rowY + 10);
        
        doc.fillColor(this.colors.accent)
           .text(`${invoiceData.montant_total.toFixed(2)} FCFA`, 50 + descriptionWidth + 10, rowY + 10, { align: 'right' });

        // Notes et conditions
        if (invoiceData?.notes) {
          doc.moveDown(3);
          this.drawSectionTitle(doc, 'NOTES', 50, doc.y);
          doc.moveDown(1);
          
          doc.font('Helvetica')
             .fontSize(10)
             .fillColor(this.colors.secondary)
             .text(invoiceData.notes, { align: 'left' });
        }

        // Informations de paiement
        doc.moveDown(2);
        this.drawSectionTitle(doc, 'INFORMATIONS DE PAIEMENT', 50, doc.y);
        doc.moveDown(1);
        
        // Tableau des paiements si disponible
        if (invoiceData.paiements && invoiceData.paiements.length > 0) {
          const paymentTableTop = doc.y;
          
          // En-tête du tableau des paiements
          doc.rect(50, paymentTableTop, tableWidth, 25)
             .fillAndStroke(this.colors.accent, this.colors.accent);
          
          doc.fillColor('white')
             .font('Helvetica-Bold')
             .fontSize(10)
             .text('DATE DE PAIEMENT', 60, paymentTableTop + 8);
          
          doc.text('MONTANT', 50 + descriptionWidth + 10, paymentTableTop + 8, { align: 'right' });

          // Lignes du tableau des paiements
          let paymentRowY = paymentTableTop + 25;
          
          invoiceData.paiements.forEach(paiement => {
            this.drawTableRow(
              doc, 
              paymentRowY, 
              new Date(paiement.date_paiement).toLocaleDateString(), 
              `${paiement.montant.toFixed(2)} FCFA`
            );
            paymentRowY += 25;
          });
        } else {
          doc.font('Helvetica')
             .fontSize(10)
             .fillColor(this.colors.secondary)
             .text('Aucun paiement enregistré.', { align: 'left' });
        }

        // Pied de page
        const footerY = doc.page.height - 100;
        doc
          .moveTo(50, footerY)
          .lineTo(doc.page.width - 50, footerY)
          .stroke(this.colors.border);
        doc
          .fontSize(8)
          .fillColor(this.colors.secondary)
          .text('NDAMAAR - Service de location de véhicules', 50, footerY + 15, { align: 'center' });
          doc.text(`Facture générée le: ${new Date().toLocaleDateString()}`, 50, footerY + 45, { align: 'center' });
          doc.text('Contact : 06 99 99 99 99', 50, footerY + 30, { align: 'left' });
        // Finaliser le document
        doc.end();

        stream.on('finish', () => {
          console.log('PDF généré avec succès:', filePath);
          resolve(filePath);
        });

        stream.on('error', (err) => {
          console.error('Erreur lors de la génération du PDF:', err);
          reject(err);
        });
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        reject(error);
      }
    });
  }

  private drawSectionTitle(doc: PDFKit.PDFDocument, title: string, x: number, y: number) {
    doc.font('Helvetica-Bold').fontSize(12).fillColor(this.colors.accent);

    // Dessiner une ligne avant le titre
    doc
      .moveTo(x, y)
      .lineTo(x + 20, y)
      .stroke(this.colors.accent);

    // Ajouter le titre
    doc.text(title, x + 25, y - 5);

    // Dessiner une ligne après le titre
    const textWidth = doc.widthOfString(title);
    doc
      .moveTo(x + 30 + textWidth, y)
      .lineTo(x + 150 + textWidth, y)
      .stroke(this.colors.accent);
  }

  private drawTableRow(
    doc: PDFKit.PDFDocument,
    y: number,
    description: string,
    amount: string,
  ) {
    const tableWidth = doc.page.width - 100;
    const descriptionWidth = tableWidth * 0.7;

    // Fond de ligne alternée
    doc.rect(50, y, tableWidth, 25).fillAndStroke('white', this.colors.border);

    // Texte de la ligne
    doc
      .fillColor(this.colors.secondary)
      .font('Helvetica')
      .fontSize(10)
      .text(description, 60, y + 8);

    doc.text(amount, 50 + descriptionWidth + 10, y + 8, { align: 'right' });
  }
}
