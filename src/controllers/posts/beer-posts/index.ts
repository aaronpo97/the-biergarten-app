import ServerError from '@/config/util/ServerError';
import deleteBeerPostById from '@/services/posts/beer-post/deleteBeerPostById';
import editBeerPostById from '@/services/posts/beer-post/editBeerPostById';
import getBeerPostById from '@/services/posts/beer-post/getBeerPostById';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';
import getBeerRecommendations from '@/services/posts/beer-post/getBeerRecommendations';
import getAllBeerPosts from '@/services/posts/beer-post/getAllBeerPosts';
import DBClient from '@/prisma/DBClient';
import createNewBeerPost from '@/services/posts/beer-post/createNewBeerPost';
import getBeerPostsByPostedById from '@/services/posts/beer-post/getBeerPostsByPostedById';
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

  const beerPost = await getBeerPostById(id);

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
  await editBeerPostById({ id: req.query.id, data: req.body });

  res.status(200).json({
    message: 'Beer post updated successfully',
    success: true,
    statusCode: 200,
  });
};

export const deleteBeerPost = async (req: BeerPostRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const deleted = await deleteBeerPostById({ beerPostId: id });
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

export const getBeerPosts = async (
  req: GetAllBeerPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const beerPosts = await getAllBeerPosts({ pageNum, pageSize });

  const beerPostCount = await DBClient.instance.beerPost.count();

  res.setHeader('X-Total-Count', beerPostCount);

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
  const { name, description, styleId: typeId, abv, ibu, breweryId } = req.body;

  const newBeerPost = await createNewBeerPost({
    name,
    description,
    abv,
    ibu,
    styleId: typeId,
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

  const beerPosts = await getBeerPostsByPostedById({
    pageNum,
    pageSize,
    postedById: id,
  });

  const beerPostCount = await DBClient.instance.beerPost.count({
    where: { postedBy: { id } },
  });

  res.setHeader('X-Total-Count', beerPostCount);

  res.status(200).json({
    message: `Beer posts by user ${id} fetched successfully`,
    statusCode: 200,
    payload: beerPosts,
    success: true,
  });
};
