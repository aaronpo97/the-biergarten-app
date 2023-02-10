import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { NextHandler, createRouter, expressWrapper } from 'next-connect';

import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';

import multer from 'multer';

import cloudinaryConfig from '@/config/cloudinary';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import ServerError from '@/config/util/ServerError';

const { storage } = cloudinaryConfig;

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadMiddleware = multer({ storage, fileFilter }).array('images');

interface UploadBeerPostImagesRequest extends UserExtendedNextApiRequest {
  files?:
    | Express.Multer.File[]
    | {
        [fieldname: string]: Express.Multer.File[];
      };

  query: {
    id: string;
  };

  // beerPost?: BeerPostQueryResult;
}

const checkIfBeerPostOwner = async (
  req: UploadBeerPostImagesRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const { id } = req.query;
  const user = req.user!;
  const beerPost = await getBeerPostById(id);

  if (!beerPost) {
    throw new ServerError('Beer post not found', 404);
  }

  if (beerPost.postedBy.id !== user.id) {
    throw new ServerError('You are not authorized to edit this beer post', 403);
  }

  return next();
};

const router = createRouter<
  UploadBeerPostImagesRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

// @ts-expect-error
router.post(getCurrentUser, expressWrapper(uploadMiddleware), checkIfBeerPostOwner);

const handler = router.handler(NextConnectOptions);
export default handler;

export const config = { api: { bodyParser: false } };
