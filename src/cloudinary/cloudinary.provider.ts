import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'dhivn2ahm',
      api_key: '736542667961595',
      api_secret: 'y9vU2UMN2ywbIyOXeQ4Kn3l6PUc',
    });
  },
};
