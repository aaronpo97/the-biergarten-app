import { NextApiResponse } from 'next';

import { z } from 'zod';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import { getBeerPostsByBeerStyleIdService } from '@/services/posts/beer-post';
import {
  createBeerStyleService,
  getAllBeerStylesService,
  getBeerStyleByIdService,
} from '@/services/posts/beer-style-post';

import { CreateBeerStyleRequest, GetBeerStyleByIdRequest } from './types';
import { GetAllPostsByConnectedPostId, GetAllPostsRequest } from '../types';

export const getBeerStyle = async (
  req: GetBeerStyleByIdRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const beerStyle = await getBeerStyleByIdService({
    beerStyleId: id,
  });

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

  const { beerPosts, count } = await getBeerPostsByBeerStyleIdService({
    pageNum: parseInt(page_num, 10),
    pageSize: parseInt(page_size, 10),
    styleId: id,
  });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: `Beers with style id ${id} retrieved successfully.`,
    statusCode: 200,
    payload: beerPosts,
    success: true,
  });
};

export const getBeerStyles = async (
  req: GetAllPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const { beerStyles, beerStyleCount } = await getAllBeerStylesService({
    pageNum,
    pageSize,
  });

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

  const beerStyle = await createBeerStyleService({
    glasswareId,
    postedById: user.id,
    body: {
      abvRange,
      description,
      ibuRange,
      name,
    },
  });

  res.json({
    message: 'Beer style created successfully.',
    statusCode: 200,
    payload: beerStyle,
    success: true,
  });
};
