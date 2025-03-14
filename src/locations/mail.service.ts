// src/locations/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Créer d'abord un compte Ethereal pour les tests
    nodemailer.createTestAccount().then((account) => {
      console.log('Compte de test email configuré:', account.user);
    });

    // Configuration du transporteur Gmail
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: 'abdouazizdiop583@gmail.com',
        pass: 'jvaq qced zeph dfpm', // Remplacez par le mot de passe d'application
      },
    });

    // Vérifier la connexion
    this.transporter
      .verify()
      .then(() => {
        console.log('Connexion SMTP établie avec succès');
      })
      .catch((err) => {
        console.error('Erreur de connexion SMTP:', err);
      });
  }

  async sendInvoiceEmail(
    to: string,
    subject: string,
    text: string,
    pdfPath: string,
  ): Promise<void> {
    const mailOptions = {
      from: '"NDAMAAR Location" <abdouazizdiop583@gmail.com>',
      to,
      subject,
      text,
      attachments: [
        {
          filename: `facture-${Date.now()}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email envoyé avec succès:', info.messageId);

      // Si vous utilisez toujours Ethereal pour les tests
      if (info.messageId.includes('ethereal')) {
        console.log(
          'URL de prévisualisation:',
          nodemailer.getTestMessageUrl(info),
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
    }
  }
}
