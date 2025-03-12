"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryProvider = void 0;
const cloudinary_1 = require("cloudinary");
exports.CloudinaryProvider = {
    provide: 'CLOUDINARY',
    useFactory: () => {
        return cloudinary_1.v2.config({
            cloud_name: 'dhivn2ahm',
            api_key: '736542667961595',
            api_secret: 'y9vU2UMN2ywbIyOXeQ4Kn3l6PUc',
        });
    },
};
//# sourceMappingURL=cloudinary.provider.js.map