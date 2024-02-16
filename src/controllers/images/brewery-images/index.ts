import ServerError from '@/config/util/ServerError';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import { addBreweryImagesService } from '@/services/images/brewery-image';
import { UploadImagesRequest } from '../types';

// eslint-disable-next-line import/prefer-default-export
export const processBreweryImageData = async (
  req: UploadImagesRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { files, user, body } = req;

  if (!files || !files.length) {
    throw new ServerError('No images uploaded', 400);
  }

  const breweryImages = await addBreweryImagesService({
    breweryPostId: req.query.postId,
    userId: user!.id,
    body,
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
