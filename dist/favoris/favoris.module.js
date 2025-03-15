"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavorisModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const favoris_controller_1 = require("./favoris.controller");
const favoris_service_1 = require("./favoris.service");
const favori_schema_1 = require("../schemas/favori.schema");
const favori_schema_2 = require("../schemas/favori.schema");
const notification_schema_1 = require("../schemas/notification.schema");
const voiture_schema_1 = require("../schemas/voiture.schema");
const offre_schema_1 = require("../schemas/offre.schema");
const offers_module_1 = require("../offers/offers.module");
const vehicles_module_1 = require("../vehicles/vehicles.module");
let FavorisModule = class FavorisModule {
};
exports.FavorisModule = FavorisModule;
exports.FavorisModule = FavorisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: favori_schema_1.FavoriVoiture.name, schema: favori_schema_1.FavoriVoitureSchema },
                { name: favori_schema_2.FavoriOffre.name, schema: favori_schema_2.FavoriOffreSchema },
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
                { name: voiture_schema_1.Voiture.name, schema: voiture_schema_1.VoitureSchema },
                { name: offre_schema_1.Offre.name, schema: offre_schema_1.OffreSchema },
            ]),
            (0, common_1.forwardRef)(() => offers_module_1.OffersModule),
            (0, common_1.forwardRef)(() => vehicles_module_1.VehiclesModule),
        ],
        controllers: [favoris_controller_1.FavorisController],
        providers: [favoris_service_1.FavorisService],
        exports: [favoris_service_1.FavorisService],
    })
], FavorisModule);
//# sourceMappingURL=favoris.module.js.map