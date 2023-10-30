import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import getBeerPostsByBeerStyleId from '@/services/BeerPost/getBeerPostsByBeerStyleId';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetAllBeersByBeerStyleRequest extends NextApiRequest {
  query: { page_size: string; page_num: string; id: string };
}

const getAllBeersByBeerStyle = async (
  req: GetAllBeersByBeerStyleRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page_size, page_num, id } = req.query;

  const beers = getBeerPostsByBeerStyleId({
    pageNum: parseInt(page_num, 10),
    pageSize: parseInt(page_size, 10),
    styleId: id,
  });

  const pageCount = await DBClient.instance.beerPost.count({ where: { styleId: id } });

  res.setHeader('X-Total-Count', pageCount);

  res.status(200).json({
    message: 'Beers fetched successfully',
    statusCode: 200,
    payload: beers,
    success: true,
  });
};

const router = createRouter<
  GetAllBeersByBeerStyleRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: z.object({
      page_size: z.string().min(1),
      page_num: z.string().min(1),
      id: z.string().min(1),
    }),
  }),
  getAllBeersByBeerStyle,
);

const handler = router.handler(NextConnectOptions);

export default handler;
