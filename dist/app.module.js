"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_schema_1 = require("./schemas/user.schema");
const client_schema_1 = require("./schemas/client.schema");
const voiture_schema_1 = require("./schemas/voiture.schema");
const offre_schema_1 = require("./schemas/offre.schema");
const reservation_schema_1 = require("./schemas/reservation.schema");
const facture_schema_1 = require("./schemas/facture.schema");
const paiement_schema_1 = require("./schemas/paiement.schema");
const favori_schema_1 = require("./schemas/favori.schema");
const authentification_schema_1 = require("./schemas/authentification.schema");
const image_schema_1 = require("./schemas/image.schema");
const auth_module_1 = require("./auth/auth.module");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const offers_module_1 = require("./offers/offers.module");
const reservations_module_1 = require("./reservations/reservations.module");
const clients_module_1 = require("./clients/clients.module");
const locations_module_1 = require("./locations/locations.module");
const location_schema_1 = require("./schemas/location.schema");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    uri: `mongodb+srv://${configService.get('DB_USER')}:${configService.get('DB_PASSWORD')}@${configService.get('DB_HOST')}/${configService.get('DB_NAME')}`,
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: client_schema_1.Client.name, schema: client_schema_1.ClientSchema },
                { name: voiture_schema_1.Voiture.name, schema: voiture_schema_1.VoitureSchema },
                { name: offre_schema_1.Offre.name, schema: offre_schema_1.OffreSchema },
                { name: reservation_schema_1.Reservation.name, schema: reservation_schema_1.ReservationSchema },
                { name: facture_schema_1.Facture.name, schema: facture_schema_1.FactureSchema },
                { name: paiement_schema_1.Paiement.name, schema: paiement_schema_1.PaiementSchema },
                { name: favori_schema_1.FavoriVoiture.name, schema: favori_schema_1.FavoriVoitureSchema },
                { name: favori_schema_1.FavoriOffre.name, schema: favori_schema_1.FavoriOffreSchema },
                { name: authentification_schema_1.Authentification.name, schema: authentification_schema_1.AuthentificationSchema },
                { name: location_schema_1.LocationContrat.name, schema: location_schema_1.LocationContratSchema },
                { name: image_schema_1.Image.name, schema: image_schema_1.ImageSchema },
            ]),
            auth_module_1.AuthModule,
            cloudinary_module_1.CloudinaryModule,
            vehicles_module_1.VehiclesModule,
            offers_module_1.OffersModule,
            reservations_module_1.ReservationsModule,
            clients_module_1.ClientsModule,
            locations_module_1.LocationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map