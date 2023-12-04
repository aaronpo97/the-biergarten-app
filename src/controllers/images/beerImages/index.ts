import ServerError from '@/config/util/ServerError';
import addBeerImageToDB from '@/services/BeerImage/addBeerImageToDB';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import { UploadBeerPostImagesRequest } from './types';

// eslint-disable-next-line import/prefer-default-export
export const processBeerImageData = async (
  req: UploadBeerPostImagesRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { files, user, body } = req;

  if (!files || !files.length) {
    throw new ServerError('No images uploaded', 400);
  }

  const beerImages = await addBeerImageToDB({
    alt: body.alt,
    caption: body.caption,
    beerPostId: req.query.id,
    userId: user!.id,
    files,
  });

  res.status(200).json({
    success: true,
    message: `Successfully uploaded ${beerImages.length} image${
      beerImages.length > 1 ? 's' : ''
    }`,
    statusCode: 200,
  });
};
