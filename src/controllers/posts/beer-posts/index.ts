import ServerError from '@/config/util/ServerError';

import {
  getBeerPostById,
  editBeerPostByIdService,
  deleteBeerPostByIdService,
  getBeerRecommendationsService,
  getAllBeerPostsService,
  createNewBeerPost,
  getBeerPostsByPostedByIdService,
} from '@/services/posts/beer-post';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';
import {
  BeerPostRequest,
  CreateBeerPostRequest,
  EditBeerPostRequest,
  GetAllBeerPostsRequest,
  GetBeerRecommendationsRequest,
} from './types';
import { GetAllPostsByConnectedPostId } from '../types';

export const checkIfBeerPostOwner = async <BeerPostRequestType extends BeerPostRequest>(
  req: BeerPostRequestType,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const { user, query } = req;
  const { id } = query;

  const beerPost = await getBeerPostById({ beerPostId: id });

  if (!beerPost) {
    throw new ServerError('Beer post not found', 404);
  }

  if (beerPost.postedBy.id !== user!.id) {
    throw new ServerError('You cannot edit that beer post.', 403);
  }

  return next();
};

export const editBeerPost = async (
  req: EditBeerPostRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  await editBeerPostByIdService({ beerPostId: req.query.id, body: req.body });

  res.status(200).json({
    message: 'Beer post updated successfully',
    success: true,
    statusCode: 200,
  });
};

export const deleteBeerPost = async (req: BeerPostRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const deleted = await deleteBeerPostByIdService({ beerPostId: id });
  if (!deleted) {
    throw new ServerError('Beer post not found', 404);
  }

  res.status(200).json({
    message: 'Beer post deleted successfully',
    success: true,
    statusCode: 200,
  });
};

export const getBeerPostRecommendations = async (
  req: GetBeerRecommendationsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const beerPost = await getBeerPostById({ beerPostId: id });

  if (!beerPost) {
    throw new ServerError('Beer post not found', 404);
  }

  const pageNum = parseInt(req.query.page_num as string, 10);
  const pageSize = parseInt(req.query.page_size as string, 10);

  const { beerRecommendations, count } = await getBeerRecommendationsService({
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

export const getBeerPosts = async (
  req: GetAllBeerPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const { beerPosts, count } = await getAllBeerPostsService({ pageNum, pageSize });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: 'Beer posts retrieved successfully',
    statusCode: 200,
    payload: beerPosts,
    success: true,
  });
};

export const createBeerPost = async (
  req: CreateBeerPostRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { name, description, styleId, abv, ibu, breweryId } = req.body;

  const newBeerPost = await createNewBeerPost({
    name,
    description,
    abv,
    ibu,
    styleId,
    breweryId,
    userId: req.user!.id,
  });

  res.status(201).json({
    message: 'Beer post created successfully',
    statusCode: 201,
    payload: newBeerPost,
    success: true,
  });
};

export const getBeerPostsByUserId = async (
  req: GetAllPostsByConnectedPostId,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const { id } = req.query;

  const { beerPosts, count } = await getBeerPostsByPostedByIdService({
    pageNum,
    pageSize,
    postedById: id,
  });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: `Beer posts by user ${id} fetched successfully`,
    statusCode: 200,
    payload: beerPosts,
    success: true,
  });
};
