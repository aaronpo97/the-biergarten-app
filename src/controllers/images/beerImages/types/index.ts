import { UserExtendedNextApiRequest } from '@/config/auth/types';
import ImageMetadataValidationSchema from '@/services/schema/ImageSchema/ImageMetadataValidationSchema';
import { z } from 'zod';

export interface UploadBeerPostImagesRequest extends UserExtendedNextApiRequest {
  files?: Express.Multer.File[];
  query: { id: string };
  body: z.infer<typeof ImageMetadataValidationSchema>;
}
