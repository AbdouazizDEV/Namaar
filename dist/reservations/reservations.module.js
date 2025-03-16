"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const reservations_controller_1 = require("./reservations.controller");
const client_reservations_controller_1 = require("./client-reservations.controller");
const reservations_service_1 = require("./reservations.service");
const reservation_schema_1 = require("../schemas/reservation.schema");
const voiture_schema_1 = require("../schemas/voiture.schema");
const offre_schema_1 = require("../schemas/offre.schema");
const user_schema_1 = require("../schemas/user.schema");
const option_supplementaire_schema_1 = require("../schemas/option-supplementaire.schema");
const transaction_schema_1 = require("../schemas/transaction.schema");
const paiement_schema_1 = require("../schemas/paiement.schema");
const facture_schema_1 = require("../schemas/facture.schema");
const client_schema_1 = require("../schemas/client.schema");
const options_service_1 = require("./options.service");
const payment_service_1 = require("./payment.service");
const options_controller_1 = require("./options.controller");
const pdf_service_1 = require("../shared/pdf.service");
const mail_service_1 = require("../locations/mail.service");
let ReservationsModule = class ReservationsModule {
};
exports.ReservationsModule = ReservationsModule;
exports.ReservationsModule = ReservationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: reservation_schema_1.Reservation.name, schema: reservation_schema_1.ReservationSchema },
                { name: voiture_schema_1.Voiture.name, schema: voiture_schema_1.VoitureSchema },
                { name: offre_schema_1.Offre.name, schema: offre_schema_1.OffreSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: option_supplementaire_schema_1.OptionSupplementaire.name, schema: option_supplementaire_schema_1.OptionSupplementaireSchema },
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
                { name: paiement_schema_1.Paiement.name, schema: paiement_schema_1.PaiementSchema },
                { name: facture_schema_1.Facture.name, schema: facture_schema_1.FactureSchema },
                { name: client_schema_1.Client.name, schema: client_schema_1.ClientSchema },
            ]),
        ],
        controllers: [
            reservations_controller_1.ReservationsController,
            options_controller_1.OptionsController,
            client_reservations_controller_1.ClientReservationsController,
        ],
        providers: [
            reservations_service_1.ReservationsService,
            options_service_1.OptionsService,
            payment_service_1.PaymentService,
            pdf_service_1.PdfService,
            mail_service_1.MailService,
        ],
        exports: [reservations_service_1.ReservationsService, options_service_1.OptionsService, payment_service_1.PaymentService],
    })
], ReservationsModule);
//# sourceMappingURL=reservations.module.js.map