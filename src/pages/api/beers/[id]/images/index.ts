import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { createRouter } from 'next-connect';

import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';

import { NextApiResponse } from 'next';
import { z } from 'zod';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import ImageMetadataValidationSchema from '@/services/schema/ImageSchema/ImageMetadataValidationSchema';
import { uploadMiddlewareMultiple } from '@/config/multer/uploadMiddleware';
import { UploadImagesRequest } from '@/controllers/images/types';
import { processBeerImageData } from '@/controllers/images/beerImages';

const router = createRouter<
  UploadImagesRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  getCurrentUser,
  // @ts-expect-error
  uploadMiddlewareMultiple,
  validateRequest({ bodySchema: ImageMetadataValidationSchema }),
  processBeerImageData,
);

const handler = router.handler(NextConnectOptions);
export default handler;

export const config = { api: { bodyParser: false } };
