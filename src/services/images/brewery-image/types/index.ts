import ImageMetadataValidationSchema from '@/services/schema/ImageSchema/ImageMetadataValidationSchema';
import { BreweryImage } from '@prisma/client';
import { z } from 'zod';

export type AddBreweryImagesToDB = (args: {
  files: Express.Multer.File[];
  body: z.infer<typeof ImageMetadataValidationSchema>;
  breweryPostId: string;
  userId: string;
}) => Promise<BreweryImage[]>;

export type DeleteBreweryImageFromDBAndStorage = (args: {
  breweryImageId: string;
}) => Promise<void>;

export type UpdateBreweryImageMetadata = (args: {
  breweryImageId: string;
  body: z.infer<typeof ImageMetadataValidationSchema>;
}) => Promise<BreweryImage>;
