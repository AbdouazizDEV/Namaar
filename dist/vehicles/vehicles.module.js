"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const vehicles_controller_1 = require("./vehicles.controller");
const vehicles_service_1 = require("./vehicles.service");
const voiture_schema_1 = require("../schemas/voiture.schema");
const image_schema_1 = require("../schemas/image.schema");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const platform_express_1 = require("@nestjs/platform-express");
const favoris_module_1 = require("../favoris/favoris.module");
let VehiclesModule = class VehiclesModule {
};
exports.VehiclesModule = VehiclesModule;
exports.VehiclesModule = VehiclesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: voiture_schema_1.Voiture.name, schema: voiture_schema_1.VoitureSchema },
                { name: image_schema_1.Image.name, schema: image_schema_1.ImageSchema },
            ]),
            cloudinary_module_1.CloudinaryModule,
            platform_express_1.MulterModule.register({
                limits: {
                    fileSize: 5 * 1024 * 1024,
                },
            }),
            (0, common_1.forwardRef)(() => favoris_module_1.FavorisModule),
        ],
        controllers: [vehicles_controller_1.VehiclesController],
        providers: [vehicles_service_1.VehiclesService],
        exports: [vehicles_service_1.VehiclesService],
    })
], VehiclesModule);
//# sourceMappingURL=vehicles.module.js.map