import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { createRouter, expressWrapper } from 'next-connect';

import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';

import multer from 'multer';

import cloudinaryConfig from '@/config/cloudinary';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import ServerError from '@/config/util/ServerError';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import ImageMetadataValidationSchema from '@/services/types/ImageSchema/ImageMetadataValidationSchema';
import addBreweryImageToDB from '@/services/BreweryImage/addBreweryImageToDB';

const { storage } = cloudinaryConfig;

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const { mimetype } = file;

  const isImage = mimetype.startsWith('image/');

  if (!isImage) {
    cb(null, false);
  }
  cb(null, true);
};

const uploadMiddleware = expressWrapper(
  multer({ storage, fileFilter, limits: { files: 5, fileSize: 15 * 1024 * 1024 } }).array(
    'images',
  ),
);

interface UploadBreweryPostImagesRequest extends UserExtendedNextApiRequest {
  files?: Express.Multer.File[];
  query: { id: string };
  body: z.infer<typeof ImageMetadataValidationSchema>;
}

const processImageData = async (
  req: UploadBreweryPostImagesRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { files, user, body } = req;

  if (!files || !files.length) {
    throw new ServerError('No images uploaded', 400);
  }

  const breweryImages = await addBreweryImageToDB({
    alt: body.alt,
    caption: body.caption,
    breweryPostId: req.query.id,
    userId: user!.id,
    files,
  });

  res.status(200).json({
    success: true,
    message: `Successfully uploaded ${breweryImages.length} image${
      breweryImages.length > 1 ? 's' : ''
    }`,
    statusCode: 200,
  });
};

const router = createRouter<
  UploadBreweryPostImagesRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  getCurrentUser,
  // @ts-expect-error
  uploadMiddleware,
  validateRequest({ bodySchema: ImageMetadataValidationSchema }),
  processImageData,
);

const handler = router.handler(NextConnectOptions);
export default handler;

export const config = { api: { bodyParser: false } };
