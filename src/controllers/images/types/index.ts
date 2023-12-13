import { UserExtendedNextApiRequest } from '@/config/auth/types';
import ImageMetadataValidationSchema from '@/services/schema/ImageSchema/ImageMetadataValidationSchema';
import { z } from 'zod';

export interface UploadImagesRequest extends UserExtendedNextApiRequest {
  files?: Express.Multer.File[];
  query: { id: string };
  body: z.infer<typeof ImageMetadataValidationSchema>;
}

export interface DeleteImageRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}
