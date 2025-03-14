"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_service_1 = require("./dashboard.service");
const reservation_schema_1 = require("../schemas/reservation.schema");
const location_schema_1 = require("../schemas/location.schema");
const voiture_schema_1 = require("../schemas/voiture.schema");
const client_schema_1 = require("../schemas/client.schema");
const user_schema_1 = require("../schemas/user.schema");
const facture_schema_1 = require("../schemas/facture.schema");
const paiement_schema_1 = require("../schemas/paiement.schema");
const alerte_schema_1 = require("../schemas/alerte.schema");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: reservation_schema_1.Reservation.name, schema: reservation_schema_1.ReservationSchema },
                { name: location_schema_1.LocationContrat.name, schema: location_schema_1.LocationContratSchema },
                { name: voiture_schema_1.Voiture.name, schema: voiture_schema_1.VoitureSchema },
                { name: client_schema_1.Client.name, schema: client_schema_1.ClientSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: facture_schema_1.Facture.name, schema: facture_schema_1.FactureSchema },
                { name: paiement_schema_1.Paiement.name, schema: paiement_schema_1.PaiementSchema },
                { name: alerte_schema_1.Alerte.name, schema: alerte_schema_1.AlerteSchema },
            ]),
        ],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService],
        exports: [dashboard_service_1.DashboardService],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map