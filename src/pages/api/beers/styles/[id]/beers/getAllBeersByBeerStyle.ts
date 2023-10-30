import DBClient from '@/prisma/DBClient';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import { GetAllBeersByBeerStyleRequest } from '.';

export const getAllBeersByBeerStyle = async (
  req: GetAllBeersByBeerStyleRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page_size, page_num, id } = req.query;

  const beers: z.infer<typeof BeerPostQueryResult>[] =
    await DBClient.instance.beerPost.findMany({
      where: { styleId: id },
      take: parseInt(page_size, 10),
      skip: parseInt(page_num, 10) * parseInt(page_size, 10),
      select: {
        id: true,
        name: true,
        ibu: true,
        abv: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        postedBy: { select: { username: true, id: true } },
        brewery: { select: { name: true, id: true } },
        style: { select: { name: true, id: true, description: true } },
        beerImages: { select: { alt: true, path: true, caption: true, id: true } },
      },
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
