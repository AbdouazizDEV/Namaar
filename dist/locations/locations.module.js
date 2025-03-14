"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const locations_controller_1 = require("./locations.controller");
const locations_service_1 = require("./locations.service");
const location_schema_1 = require("../schemas/location.schema");
const reservation_schema_1 = require("../schemas/reservation.schema");
const voiture_schema_1 = require("../schemas/voiture.schema");
const user_schema_1 = require("../schemas/user.schema");
const facture_schema_1 = require("../schemas/facture.schema");
const paiement_schema_1 = require("../schemas/paiement.schema");
const client_schema_1 = require("../schemas/client.schema");
const mail_service_1 = require("./mail.service");
const pdf_service_1 = require("./pdf.service");
const offre_schema_1 = require("../schemas/offre.schema");
let LocationsModule = class LocationsModule {
};
exports.LocationsModule = LocationsModule;
exports.LocationsModule = LocationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: location_schema_1.LocationContrat.name, schema: location_schema_1.LocationContratSchema },
                { name: reservation_schema_1.Reservation.name, schema: reservation_schema_1.ReservationSchema },
                { name: voiture_schema_1.Voiture.name, schema: voiture_schema_1.VoitureSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: facture_schema_1.Facture.name, schema: facture_schema_1.FactureSchema },
                { name: paiement_schema_1.Paiement.name, schema: paiement_schema_1.PaiementSchema },
                { name: client_schema_1.Client.name, schema: client_schema_1.ClientSchema },
                { name: offre_schema_1.Offre.name, schema: offre_schema_1.OffreSchema },
            ]),
        ],
        controllers: [locations_controller_1.LocationsController],
        providers: [locations_service_1.LocationsService, mail_service_1.MailService, pdf_service_1.PdfService],
    })
], LocationsModule);
//# sourceMappingURL=locations.module.js.map