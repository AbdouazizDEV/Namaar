import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse>;
    uploadMultipleImages(files: Express.Multer.File[]): Promise<(UploadApiResponse | UploadApiErrorResponse)[]>;
    deleteImage(publicId: string): Promise<any>;
}
