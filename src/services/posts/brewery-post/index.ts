import DBClient from '@/prisma/DBClient';

import {
  CreateBreweryPostLocation,
  CreateNewBreweryPost,
  GetAllBreweryPosts,
  GetAllBreweryPostsByPostedById,
  GetBreweryPostById,
  GetMapBreweryPosts,
} from './types';

/**
 * The select object to use when querying for brewery posts.
 *
 * @remarks
 *   Prisma does not support tuples, so we have to typecast the coordinates field to
 *   [number, number] in order to satisfy the zod schema.
 */
const breweryPostSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  dateEstablished: true,
  postedBy: { select: { id: true, username: true } },
  breweryImages: {
    select: {
      path: true,
      caption: true,
      id: true,
      alt: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  location: {
    select: {
      city: true,
      address: true,
      coordinates: true,
      country: true,
      stateOrProvince: true,
    },
  },
} as const;

/**
 * Creates a new brewery post.
 *
 * @param args - The arguments to create a new brewery post.
 * @param args.name - The name of the brewery.
 * @param args.description - The description of the brewery.
 * @param args.dateEstablished - The date the brewery was established.
 * @param args.userId - The id of the user who created the brewery post.
 * @param args.locationId - The id of the location of the brewery.
 * @returns The newly created brewery post.
 */
export const createNewBreweryPostService: CreateNewBreweryPost = async ({
  dateEstablished,
  description,
  locationId,
  name,
  userId,
}) => {
  const post = (await DBClient.instance.breweryPost.create({
    data: {
      name,
      description,
      dateEstablished,
      location: { connect: { id: locationId } },
      postedBy: { connect: { id: userId } },
    },
    select: breweryPostSelect,
  })) as Awaited<ReturnType<typeof createNewBreweryPostService>>;

  return post;
};

/**
 * Retrieves all brewery posts paginated.
 *
 * @param args - The arguments to get all brewery posts.
 * @param args.pageNum - The page number of the brewery posts to get.
 * @param args.pageSize - The number of brewery posts to get per page.
 * @returns All brewery posts.
 */
export const getAllBreweryPostsService: GetAllBreweryPosts = async ({
  pageNum,
  pageSize,
}) => {
  const breweryPosts = (await DBClient.instance.breweryPost.findMany({
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: breweryPostSelect,
    orderBy: { createdAt: 'desc' },
  })) as Awaited<ReturnType<typeof getAllBreweryPostsService>>['breweryPosts'];

  const count = await DBClient.instance.breweryPost.count();
  return { breweryPosts, count };
};

/**
 * Retrieves a brewery post by ID.
 *
 * @param args - The arguments to get a brewery post by ID.
 * @param args.breweryPostId - The ID of the brewery post to get.
 * @returns The brewery post.
 */
export const getBreweryPostByIdService: GetBreweryPostById = async ({
  breweryPostId,
}) => {
  const breweryPost = await DBClient.instance.breweryPost.findFirst({
    select: breweryPostSelect,
    where: { id: breweryPostId },
  });

  return breweryPost as Awaited<ReturnType<typeof getBreweryPostByIdService>>;
};

/**
 * Retrieves all brewery posts by posted by ID.
 *
 * @param args - The arguments to get all brewery posts by posted by ID.
 * @param args.pageNum - The page number of the brewery posts to get.
 * @param args.pageSize - The number of brewery posts to get per page.
 * @param args.postedById - The ID of the user who posted the brewery posts.
 */
export const getAllBreweryPostsByPostedByIdService: GetAllBreweryPostsByPostedById =
  async ({ pageNum, pageSize, postedById }) => {
    const breweryPosts = (await DBClient.instance.breweryPost.findMany({
      where: { postedBy: { id: postedById } },
      take: pageSize,
      skip: (pageNum - 1) * pageSize,
      select: breweryPostSelect,
      orderBy: { createdAt: 'desc' },
    })) as Awaited<
      ReturnType<typeof getAllBreweryPostsByPostedByIdService>
    >['breweryPosts'];

    const count = await DBClient.instance.breweryPost.count({
      where: { postedBy: { id: postedById } },
    });

    return { breweryPosts, count };
  };

/**
 * Creates a brewery post location.
 *
 * @param args - The arguments to create a brewery post location.
 * @param args.body - The body of the request.
 * @param args.body.address - The address of the brewery.
 * @param args.body.city - The city of the brewery.
 * @param args.body.country - The country of the brewery.
 * @param args.body.stateOrProvince - The state or province of the brewery.
 * @param args.body.coordinates - The coordinates of the brewery in an array of [latitude,
 *   longitude].
 * @param args.postedById - The ID of the user who posted the brewery post.
 * @returns The newly created brewery post location.
 */
export const createBreweryPostLocationService: CreateBreweryPostLocation = async ({
  body: { address, city, country, stateOrProvince, coordinates },
  postedById,
}) => {
  const [latitude, longitude] = coordinates;

  return DBClient.instance.breweryLocation.create({
    data: {
      address,
      city,
      country,
      stateOrProvince,
      coordinates: [latitude, longitude],
      postedBy: { connect: { id: postedById } },
    },
    select: { id: true },
  });
};

/**
 * Gets all brewery posts for the post map.
 *
 * @param args - The arguments to get all brewery posts for the post map.
 * @param args.pageNum - The page number of the brewery posts to get.
 * @param args.pageSize - The number of brewery posts to get per page.
 * @returns All brewery posts for the post map.
 */
export const getMapBreweryPostsService: GetMapBreweryPosts = async ({
  pageNum,
  pageSize,
}) => {
  const breweryPosts = await DBClient.instance.breweryPost.findMany({
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: {
      id: true,
      name: true,
      location: {
        select: { coordinates: true, city: true, country: true, stateOrProvince: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const count = await DBClient.instance.breweryPost.count();
  return { breweryPosts, count };
};
