import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter, NextHandler } from 'next-connect';
import { z } from 'zod';
import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import getBreweryPostById from '@/services/BreweryPost/getBreweryPostById';
import EditBreweryPostValidationSchema from '@/services/BreweryPost/schema/EditBreweryPostValidationSchema';

interface BreweryPostRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}

interface EditBreweryPostRequest extends BreweryPostRequest {
  body: z.infer<typeof EditBreweryPostValidationSchema>;
}

const checkIfBreweryPostOwner = async (
  req: BreweryPostRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const user = req.user!;
  const { id } = req.query;

  const breweryPost = await getBreweryPostById(id);
  if (!breweryPost) {
    throw new ServerError('Brewery post not found', 404);
  }

  if (breweryPost.postedBy.id !== user.id) {
    throw new ServerError('You are not the owner of this brewery post', 403);
  }

  return next();
};

const editBreweryPost = async (
  req: EditBreweryPostRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const {
    body,
    query: { id },
  } = req;

  await DBClient.instance.breweryPost.update({
    where: { id },
    data: body,
  });

  res.status(200).json({
    message: 'Brewery post updated successfully',
    success: true,
    statusCode: 200,
  });
};

const deleteBreweryPost = async (req: BreweryPostRequest, res: NextApiResponse) => {
  const {
    query: { id },
  } = req;

  const deleted = await DBClient.instance.breweryPost.delete({ where: { id } });

  if (!deleted) {
    throw new ServerError('Brewery post not found', 404);
  }

  res.status(200).json({
    message: 'Brewery post deleted successfully',
    success: true,
    statusCode: 200,
  });
};
const router = createRouter<
  EditBreweryPostRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.put(getCurrentUser, checkIfBreweryPostOwner, editBreweryPost);
router.delete(getCurrentUser, checkIfBreweryPostOwner, deleteBreweryPost);

const handler = router.handler(NextConnectOptions);

export default handler;
