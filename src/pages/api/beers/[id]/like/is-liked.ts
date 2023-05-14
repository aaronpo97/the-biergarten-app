import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import findBeerPostLikeById from '@/services/BeerPostLike/findBeerPostLikeById';

const checkIfLiked = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const beerPostId = req.query.id as string;

  const alreadyLiked = await findBeerPostLikeById({ beerPostId, likedById: user.id });

  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Beer post is liked.' : 'Beer post is not liked.',
    statusCode: 200,
    payload: { isLiked: !!alreadyLiked },
  });
};

const router = createRouter<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  getCurrentUser,
  validateRequest({ querySchema: z.object({ id: z.string().uuid() }) }),
  checkIfLiked,
);

const handler = router.handler(NextConnectOptions);
export default handler;
