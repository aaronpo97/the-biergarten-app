import { NextApiResponse } from 'next';

import { z } from 'zod';
import DBClient from '@/prisma/DBClient';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import getBeerStyleById from '@/services/posts/beer-style-post/getBeerStyleById';
import getBeerPostsByBeerStyleId from '@/services/posts/beer-post/getBeerPostsByBeerStyleId';
import getAllBeerStyles from '@/services/posts/beer-style-post/getAllBeerStyles';

import ServerError from '@/config/util/ServerError';
import { CreateBeerStyleRequest, GetBeerStyleByIdRequest } from './types';
import { GetAllPostsByConnectedPostId, GetAllPostsRequest } from '../types';

export const getBeerStyle = async (
  req: GetBeerStyleByIdRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const beerStyle = await getBeerStyleById(id);

  res.status(200).json({
    message: 'Beer style retrieved successfully.',
    statusCode: 200,
    payload: beerStyle,
    success: true,
  });
};

export const getAllBeersByBeerStyle = async (
  req: GetAllPostsByConnectedPostId,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page_size, page_num, id } = req.query;

  const beers = await getBeerPostsByBeerStyleId({
    pageNum: parseInt(page_num, 10),
    pageSize: parseInt(page_size, 10),
    styleId: id,
  });

  const count = await DBClient.instance.beerPost.count({ where: { styleId: id } });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: `Beers with style id ${id} retrieved successfully.`,
    statusCode: 200,
    payload: beers,
    success: true,
  });
};

export const getBeerStyles = async (
  req: GetAllPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const beerStyles = await getAllBeerStyles({ pageNum, pageSize });
  const beerStyleCount = await DBClient.instance.beerStyle.count();

  res.setHeader('X-Total-Count', beerStyleCount);

  res.status(200).json({
    message: 'Beer styles retrieved successfully.',
    statusCode: 200,
    payload: beerStyles,
    success: true,
  });
};

export const createBeerStyle = async (
  req: CreateBeerStyleRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { abvRange, description, glasswareId, ibuRange, name } = req.body;

  const user = req.user!;

  const glassware = await DBClient.instance.glassware.findUnique({
    where: { id: glasswareId },
    select: { id: true },
  });

  if (!glassware) {
    throw new ServerError('Glassware not found.', 404);
  }

  const beerStyle = await DBClient.instance.beerStyle.create({
    data: {
      abvRange,
      description,
      glassware: { connect: { id: glasswareId } },
      ibuRange,
      name,
      postedBy: { connect: { id: user.id } },
    },
  });

  res.json({
    message: 'Beer style created successfully.',
    statusCode: 200,
    payload: beerStyle,
    success: true,
  });
};
