import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import geocode from '@/config/mapbox/geocoder';
import ServerError from '@/config/util/ServerError';

import {
  getAllBreweryPostsByPostedByIdService,
  getAllBreweryPostsService,
  createNewBreweryPostService,
  createBreweryPostLocationService,
  getMapBreweryPostsService,
  getBreweryPostByIdService,
  updateBreweryPostService,
  deleteBreweryPostService,
} from '@/services/posts/brewery-post';
import { getBeerPostsByBreweryIdService } from '@/services/posts/beer-post';
import { NextHandler } from 'next-connect';

import {
  BreweryPostRequest,
  CreateBreweryPostRequest,
  EditBreweryPostRequest,
  GetBreweryPostsRequest,
} from './types';
import { GetAllPostsByConnectedPostId } from '../types';

export const getBreweryPostsByUserId = async (
  req: GetAllPostsByConnectedPostId,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const { id } = req.query;

  const { breweryPosts, count } = await getAllBreweryPostsByPostedByIdService({
    pageNum,
    pageSize,
    postedById: id,
  });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: `Brewery posts by user ${id} fetched successfully`,
    statusCode: 200,
    payload: breweryPosts,
    success: true,
  });
};

export const getBreweryPosts = async (
  req: GetBreweryPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const { breweryPosts, count } = await getAllBreweryPostsService({ pageNum, pageSize });

  res.setHeader('X-Total-Count', count);
  res.status(200).json({
    message: 'Brewery posts retrieved successfully',
    statusCode: 200,
    payload: breweryPosts,
    success: true,
  });
};

export const createBreweryPost = async (
  req: CreateBreweryPostRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { name, description, dateEstablished, address, city, country, region } = req.body;
  const userId = req.user!.id;

  const fullAddress = `${address}, ${city}, ${region}, ${country}`;

  const geocoded = await geocode(fullAddress);

  if (!geocoded) {
    throw new ServerError('Address is not valid', 400);
  }

  const [latitude, longitude] = geocoded.center;

  const location = await createBreweryPostLocationService({
    body: {
      address,
      city,
      country,
      stateOrProvince: region,
      coordinates: [latitude, longitude],
    },
    postedById: userId,
  });

  const newBreweryPost = await createNewBreweryPostService({
    name,
    description,
    locationId: location.id,
    dateEstablished,
    userId,
  });

  res.status(201).json({
    message: 'Brewery post created successfully',
    statusCode: 201,
    payload: newBreweryPost,
    success: true,
  });
};

export const getMapBreweryPosts = async (
  req: GetBreweryPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const { breweryPosts, count } = await getMapBreweryPostsService({
    pageNum,
    pageSize,
  });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: 'Brewery posts retrieved successfully',
    statusCode: 200,
    payload: breweryPosts,
    success: true,
  });
};

export const getAllBeersByBrewery = async (
  req: GetAllPostsByConnectedPostId,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page_size, page_num, id } = req.query;

  const pageNum = parseInt(page_num, 10);
  const pageSize = parseInt(page_size, 10);

  const { beerPosts, count } = await getBeerPostsByBreweryIdService({
    pageNum,
    pageSize,
    breweryId: id,
  });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: 'Beers fetched successfully',
    statusCode: 200,
    payload: beerPosts,
    success: true,
  });
};

export const checkIfBreweryPostOwner = async (
  req: BreweryPostRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const user = req.user!;
  const { postId } = req.query;

  const breweryPost = await getBreweryPostByIdService({ breweryPostId: postId });
  if (!breweryPost) {
    throw new ServerError('Brewery post not found', 404);
  }

  if (breweryPost.postedBy.id !== user.id) {
    throw new ServerError('You are not the owner of this brewery post', 403);
  }

  return next();
};

export const editBreweryPost = async (
  req: EditBreweryPostRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const {
    body,
    query: { postId },
  } = req;

  await updateBreweryPostService({ breweryPostId: postId, body });

  res.status(200).json({
    message: 'Brewery post updated successfully',
    success: true,
    statusCode: 200,
  });
};

export const deleteBreweryPost = async (
  req: BreweryPostRequest,
  res: NextApiResponse,
) => {
  const { postId } = req.query;
  const deleted = await deleteBreweryPostService({ breweryPostId: postId });

  if (!deleted) {
    throw new ServerError('Brewery post not found', 404);
  }

  res.status(200).json({
    message: 'Brewery post deleted successfully',
    success: true,
    statusCode: 200,
  });
};
