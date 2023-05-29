import DBClient from '@/prisma/DBClient';
import getAllBeerComments from '@/services/BeerComment/getAllBeerComments';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import createNewBeerComment from '@/services/BeerComment/createNewBeerComment';

import { createRouter } from 'next-connect';
import { z } from 'zod';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { NextApiResponse } from 'next';
import CommentQueryResult from '@/services/types/CommentSchema/CommentQueryResult';
import CreateCommentValidationSchema from '@/services/types/CommentSchema/CreateCommentValidationSchema';

interface CreateCommentRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof CreateCommentValidationSchema>;
  query: { id: string };
}

interface GetAllCommentsRequest extends UserExtendedNextApiRequest {
  query: { id: string; page_size: string; page_num: string };
}

const createComment = async (
  req: CreateCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { content, rating } = req.body;

  const beerPostId = req.query.id;

  const newBeerComment: z.infer<typeof CommentQueryResult> = await createNewBeerComment({
    content,
    rating,
    beerPostId,
    userId: req.user!.id,
  });

  res.status(201).json({
    message: 'Beer comment created successfully',
    statusCode: 201,
    payload: newBeerComment,
    success: true,
  });
};

const getAll = async (
  req: GetAllCommentsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const beerPostId = req.query.id;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page_size, page_num } = req.query;

  const comments = await getAllBeerComments(
    { id: beerPostId },
    { pageSize: parseInt(page_size, 10), pageNum: parseInt(page_num, 10) },
  );

  const pageCount = await DBClient.instance.beerComment.count({ where: { beerPostId } });

  res.setHeader('X-Total-Count', pageCount);

  res.status(200).json({
    message: 'Beer comments fetched successfully',
    statusCode: 200,
    payload: comments,
    success: true,
  });
};

const router = createRouter<
  // I don't want to use any, but I can't figure out how to get the types to work
  any,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({
    bodySchema: CreateCommentValidationSchema,
    querySchema: z.object({ id: z.string().cuid() }),
  }),
  getCurrentUser,
  createComment,
);

router.get(
  validateRequest({
    querySchema: z.object({
      id: z.string().cuid(),
      page_size: z.coerce.number().int().positive(),
      page_num: z.coerce.number().int().positive(),
    }),
  }),
  getAll,
);

const handler = router.handler(NextConnectOptions);
export default handler;
