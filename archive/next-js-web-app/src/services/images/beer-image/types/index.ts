import ImageMetadataValidationSchema from '@/services/schema/ImageSchema/ImageMetadataValidationSchema';
import { BeerImage } from '@prisma/client';
import { z } from 'zod';

export type AddBeerImagesToDB = (args: {
  files: Express.Multer.File[];
  body: z.infer<typeof ImageMetadataValidationSchema>;
  beerPostId: string;
  userId: string;
}) => Promise<BeerImage[]>;

export type DeleteBeerImageFromDBAndStorage = (args: {
  beerImageId: string;
}) => Promise<void>;

export type UpdateBeerImageMetadata = (args: {
  beerImageId: string;
  body: z.infer<typeof ImageMetadataValidationSchema>;
}) => Promise<BeerImage>;
