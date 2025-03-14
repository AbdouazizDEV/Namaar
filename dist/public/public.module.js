"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const public_controller_1 = require("./public.controller");
const public_service_1 = require("./public.service");
const voiture_schema_1 = require("../schemas/voiture.schema");
const image_schema_1 = require("../schemas/image.schema");
const offre_schema_1 = require("../schemas/offre.schema");
const reservation_schema_1 = require("../schemas/reservation.schema");
let PublicModule = class PublicModule {
};
exports.PublicModule = PublicModule;
exports.PublicModule = PublicModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: voiture_schema_1.Voiture.name, schema: voiture_schema_1.VoitureSchema },
                { name: image_schema_1.Image.name, schema: image_schema_1.ImageSchema },
                { name: offre_schema_1.Offre.name, schema: offre_schema_1.OffreSchema },
                { name: reservation_schema_1.Reservation.name, schema: reservation_schema_1.ReservationSchema },
            ]),
        ],
        controllers: [public_controller_1.PublicController],
        providers: [public_service_1.PublicService],
        exports: [public_service_1.PublicService],
    })
], PublicModule);
//# sourceMappingURL=public.module.js.map