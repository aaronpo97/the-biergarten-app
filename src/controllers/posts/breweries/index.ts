import DBClient from '@/prisma/DBClient';
import getAllBreweryPostsByPostedById from '@/services/BreweryPost/getAllBreweryPostsByPostedById';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import getAllBreweryPosts from '@/services/BreweryPost/getAllBreweryPosts';
import createNewBreweryPost from '@/services/BreweryPost/createNewBreweryPost';
import geocode from '@/config/mapbox/geocoder';
import ServerError from '@/config/util/ServerError';
import BreweryPostMapQueryResult from '@/services/BreweryPost/schema/BreweryPostMapQueryResult';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { CreateBreweryPostRequest, GetBreweryPostsRequest } from './types';
import { GetAllPostsByConnectedPostId } from '../types';

export const getBreweryPostsByUserId = async (
  req: GetAllPostsByConnectedPostId,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const { id } = req.query;

  const breweryPosts = await getAllBreweryPostsByPostedById({
    pageNum,
    pageSize,
    postedById: id,
  });

  const breweryPostCount = await DBClient.instance.breweryPost.count({
    where: { postedBy: { id } },
  });

  res.setHeader('X-Total-Count', breweryPostCount);

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

  const breweryPosts = await getAllBreweryPosts({ pageNum, pageSize });
  const breweryPostCount = await DBClient.instance.breweryPost.count();

  res.setHeader('X-Total-Count', breweryPostCount);
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

  const location = await DBClient.instance.breweryLocation.create({
    data: {
      address,
      city,
      country,
      stateOrProvince: region,
      coordinates: [latitude, longitude],
      postedBy: { connect: { id: userId } },
    },
    select: { id: true },
  });

  const newBreweryPost = await createNewBreweryPost({
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

  const skip = (pageNum - 1) * pageSize;
  const take = pageSize;

  const breweryPosts: z.infer<typeof BreweryPostMapQueryResult>[] =
    await DBClient.instance.breweryPost.findMany({
      select: {
        location: {
          select: { coordinates: true, city: true, country: true, stateOrProvince: true },
        },
        id: true,
        name: true,
      },
      skip,
      take,
    });
  const breweryPostCount = await DBClient.instance.breweryPost.count();

  res.setHeader('X-Total-Count', breweryPostCount);

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

  const beers: z.infer<typeof BeerPostQueryResult>[] =
    await DBClient.instance.beerPost.findMany({
      where: { breweryId: id },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
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
        beerImages: {
          select: {
            alt: true,
            path: true,
            caption: true,
            id: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

  const count = await DBClient.instance.beerPost.count({
    where: { breweryId: id },
  });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: 'Beers fetched successfully',
    statusCode: 200,
    payload: beers,
    success: true,
  });
};
