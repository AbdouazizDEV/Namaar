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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let MailService = class MailService {
    constructor() {
        nodemailer.createTestAccount().then((account) => {
            console.log('Compte de test email configuré:', account.user);
        });
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'abdouazizdiop583@gmail.com',
                pass: 'jvaq qced zeph dfpm',
            },
        });
        this.transporter
            .verify()
            .then(() => {
            console.log('Connexion SMTP établie avec succès');
        })
            .catch((err) => {
            console.error('Erreur de connexion SMTP:', err);
        });
    }
    async sendInvoiceEmail(to, subject, text, pdfPath) {
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
            if (info.messageId.includes('ethereal')) {
                console.log('URL de prévisualisation:', nodemailer.getTestMessageUrl(info));
            }
        }
        catch (error) {
            console.error("Erreur lors de l'envoi de l'email:", error);
            throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map