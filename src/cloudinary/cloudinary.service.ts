import { Express } from 'express';
import { Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ndamaar/vehicles',
        },
        (error, result) => {
          if (error)
            return reject(
              new Error(`Cloudinary upload error: ${error.message}`),
            );
          if (result) resolve(result);
          else reject(new Error('Failed to upload image'));
        },
      );

      // Créer un stream à partir du buffer du fichier
      if (file) {
        const fileStream = new Readable();
        fileStream.push(file.buffer);
        fileStream.push(null);
        fileStream.pipe(uploadStream);
      } else {
        // handle the case where file is null or undefined
        // for example, you could reject the promise with an error
        return reject(new Error('No file provided'));
      }
    });
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
  ): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
}
