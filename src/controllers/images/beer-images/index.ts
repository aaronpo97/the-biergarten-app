import ServerError from '@/config/util/ServerError';
import {
  addBeerImagesToDB,
  deleteBeerImageFromDBAndStorage,
} from '@/services/images/beer-image';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import { DeleteImageRequest, UploadImagesRequest } from '../types';

// eslint-disable-next-line import/prefer-default-export
export const processBeerImageData = async (
  req: UploadImagesRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { files, user, body } = req;

  if (!files || !files.length) {
    throw new ServerError('No images uploaded', 400);
  }

  const beerImages = await addBeerImagesToDB({
    beerPostId: req.query.id,
    userId: user!.id,
    body,
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

export const deleteBeerImageData = async (
  req: DeleteImageRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  await deleteBeerImageFromDBAndStorage({ beerImageId: id });

  res.status(200).json({
    success: true,
    message: `Successfully deleted image with id ${id}`,
    statusCode: 200,
  });
};
