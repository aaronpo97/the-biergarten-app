import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import DBClient from '@/prisma/DBClient';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';

const SearchSchema = z.object({
  search: z.string().min(1),
});

interface SearchAPIRequest extends NextApiRequest {
  query: z.infer<typeof SearchSchema>;
}

const search = async (req: SearchAPIRequest, res: NextApiResponse) => {
  const { search: query } = req.query;

  const beers: z.infer<typeof BeerPostQueryResult>[] =
    await DBClient.instance.beerPost.findMany({
      select: {
        id: true,
        name: true,
        ibu: true,
        abv: true,
        createdAt: true,
        description: true,
        postedBy: { select: { username: true, id: true } },
        brewery: { select: { name: true, id: true } },
        style: { select: { name: true, id: true, description: true } },
        beerImages: { select: { alt: true, path: true, caption: true, id: true } },
      },
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { brewery: { name: { contains: query, mode: 'insensitive' } } },
          { style: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
    });

  res.status(200).json(beers);
};

const router = createRouter<
  SearchAPIRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(validateRequest({}), search);

const handler = router.handler(NextConnectOptions);

export default handler;
