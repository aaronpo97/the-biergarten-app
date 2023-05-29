import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import ServerError from '@/config/util/ServerError';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import getBeerRecommendations from '@/services/BeerPost/getBeerRecommendations';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface BeerPostRequest extends NextApiRequest {
  query: { id: string; page_num: string; page_size: string };
}

const router = createRouter<
  BeerPostRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

const getBeerRecommendationsRequest = async (
  req: BeerPostRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const beerPost = await getBeerPostById(id);

  if (!beerPost) {
    throw new ServerError('Beer post not found', 404);
  }

  const pageNum = parseInt(req.query.page_num as string, 10);
  const pageSize = parseInt(req.query.page_size as string, 10);

  const { count, beerRecommendations } = await getBeerRecommendations({
    beerPost,
    pageNum,
    pageSize,
  });

  res.setHeader('X-Total-Count', count);
  res.status(200).json({
    success: true,
    message: 'Recommendations fetched successfully',
    statusCode: 200,
    payload: beerRecommendations,
  });
};

router.get(
  validateRequest({
    querySchema: z.object({
      id: z.string().cuid(),
      page_num: z.string().regex(/^[0-9]+$/),
      page_size: z.string().regex(/^[0-9]+$/),
    }),
  }),
  getBeerRecommendationsRequest,
);

const handler = router.handler(NextConnectOptions);

export default handler;
