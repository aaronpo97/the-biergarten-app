import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

import {
  checkIfBreweryPostOwner,
  editBreweryPost,
  deleteBreweryPost,
} from '@/controllers/posts/breweries';
import { EditBreweryPostRequest } from '@/controllers/posts/breweries/types';

const router = createRouter<
  EditBreweryPostRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.put(getCurrentUser, checkIfBreweryPostOwner, editBreweryPost);
router.delete(getCurrentUser, checkIfBreweryPostOwner, deleteBreweryPost);

const handler = router.handler(NextConnectOptions);

export default handler;
