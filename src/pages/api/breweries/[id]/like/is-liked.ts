import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const checkIfLiked = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const id = req.query.id as string;

  const alreadyLiked = await DBClient.instance.breweryPostLike.findFirst({
    where: {
      breweryPostId: id,
      likedById: user.id,
    },
  });

  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Brewery post is liked.' : 'Brewery post is not liked.',
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
  validateRequest({
    querySchema: z.object({
      id: z.string().cuid(),
    }),
  }),
  checkIfLiked,
);

const handler = router.handler(NextConnectOptions);
export default handler;
