import DBClient from '@/prisma/DBClient';
import {
  CreateNewBeerPost,
  EditBeerPostById,
  FindOrDeleteBeerPostById,
  GetAllBeerPosts,
  GetAllBeerPostsByBreweryId,
  GetAllBeerPostsByPostedById,
  GetAllBeerPostsByStyleId,
  GetBeerRecommendations,
} from './types';

/**
 * The select object for retrieving beer posts.
 *
 * Satisfies the BeerPostQueryResult zod schema.
 *
 * @example
 *   const beerPosts = await DBClient.instance.beerPost.findMany({
 *     select: beerPostSelect,
 *   });
 */
const beerPostSelect = {
  id: true,
  name: true,
  description: true,
  abv: true,
  ibu: true,
  createdAt: true,
  updatedAt: true,
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
  brewery: { select: { id: true, name: true } },
  style: { select: { id: true, name: true, description: true } },
  postedBy: { select: { id: true, username: true } },
} as const;

/**
 * Creates a new beer post.
 *
 * @param params - The parameters object for creating the beer post.
 * @param params.name - The name of the beer.
 * @param params.description - The description of the beer.
 * @param params.abv - The alcohol by volume of the beer.
 * @param params.ibu - The International Bitterness Units of the beer.
 * @param params.styleId - The ID of the beer style.
 * @param params.breweryId - The ID of the brewery.
 * @param params.userId - The ID of the user who posted the beer.
 * @returns A promise that resolves to the newly created beer post.
 */
export const createNewBeerPost: CreateNewBeerPost = ({
  name,
  description,
  abv,
  ibu,
  styleId,
  breweryId,
  userId,
}) => {
  return DBClient.instance.beerPost.create({
    data: {
      name,
      description,
      abv,
      ibu,
      style: { connect: { id: styleId } },
      postedBy: { connect: { id: userId } },
      brewery: { connect: { id: breweryId } },
    },
    select: beerPostSelect,
  });
};

/**
 * Retrieves a beer post by ID.
 *
 * @param params - The parameters object for retrieving the beer post.
 * @param params.beerPostId - The ID of the beer post to retrieve.
 * @returns A promise that resolves to the beer post.
 */
export const getBeerPostById: FindOrDeleteBeerPostById = async ({ beerPostId }) => {
  return DBClient.instance.beerPost.findFirst({
    where: { id: beerPostId },
    select: beerPostSelect,
  });
};

/**
 * Retrieves all beer posts with pagination.
 *
 * @param params - The parameters object for retrieving beer posts.
 * @param params.pageNum The page number to retrieve.
 * @param params.pageSize The number of beer posts per page.
 * @returns An object containing the beer posts and the total count.
 */
export const getAllBeerPostsService: GetAllBeerPosts = async ({ pageNum, pageSize }) => {
  const beerPosts = await DBClient.instance.beerPost.findMany({
    select: beerPostSelect,
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    orderBy: { createdAt: 'desc' },
  });

  const count = await DBClient.instance.beerPost.count();

  return { beerPosts, count };
};

/**
 * Retrieves beer posts by beer style ID.
 *
 * @param params - The parameters object for retrieving beer posts.
 * @param params.pageNum - The page number of the results.
 * @param params.pageSize - The number of results per page.
 * @param params.styleId - The ID of the beer style.
 * @returns A promise that resolves to an object containing the beer posts and the total
 *   count.
 */
export const getBeerPostsByBeerStyleIdService: GetAllBeerPostsByStyleId = async ({
  pageNum,
  pageSize,
  styleId,
}) => {
  const beerPosts = await DBClient.instance.beerPost.findMany({
    where: { styleId },
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: beerPostSelect,
  });

  const count = await DBClient.instance.beerPost.count({
    where: { styleId },
  });

  return { beerPosts, count };
};

/**
 * Retrieves beer posts by brewery ID.
 *
 * @param params - The parameters object for retrieving beer posts.
 * @param params.pageNum - The page number of the results.
 * @param params.pageSize - The number of beer posts per page.
 * @param params.breweryId - The ID of the brewery.
 * @returns A promise that resolves to an object containing the beer posts and the total
 *   count.
 */
export const getBeerPostsByBreweryIdService: GetAllBeerPostsByBreweryId = async ({
  pageNum,
  pageSize,
  breweryId,
}) => {
  const beerPosts = await DBClient.instance.beerPost.findMany({
    where: { breweryId },
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: beerPostSelect,
  });

  const count = await DBClient.instance.beerPost.count({
    where: { breweryId },
  });

  return { beerPosts, count };
};

/**
 * Retrieves beer posts by the ID of the user who posted them.
 *
 * @param params - The parameters object for retrieving beer posts.
 * @param params.pageNum The page number of the results.
 * @param params.pageSize The number of results per page.
 * @param params.postedById The ID of the user who posted the beer posts.
 * @returns A promise that resolves to an object containing the beer posts and the total
 *   count.
 */
export const getBeerPostsByPostedByIdService: GetAllBeerPostsByPostedById = async ({
  pageNum,
  pageSize,
  postedById,
}) => {
  const beerPosts = await DBClient.instance.beerPost.findMany({
    where: { postedById },
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: beerPostSelect,
  });

  const count = await DBClient.instance.beerPost.count({
    where: { postedById },
  });

  return { beerPosts, count };
};

/**
 * Retrieves beer recommendations based on the given parameters.
 *
 * @param params - The parameters object for retrieving beer recommendations.
 * @param params.beerPost - The beer post for which recommendations are requested.
 * @param params.pageNum - The page number of the recommendations.
 * @param params.pageSize - The number of recommendations per page.
 * @returns A promise that resolves to an object containing the beer recommendations and
 *   the total count.
 */
export const getBeerRecommendationsService: GetBeerRecommendations = async ({
  beerPost,
  pageNum,
  pageSize,
}) => {
  const beerRecommendations = await DBClient.instance.beerPost.findMany({
    where: {
      OR: [{ styleId: beerPost.style.id }, { breweryId: beerPost.brewery.id }],
      NOT: { id: beerPost.id },
    },
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: beerPostSelect,
  });

  const count = await DBClient.instance.beerPost.count({
    where: {
      OR: [{ styleId: beerPost.style.id }, { breweryId: beerPost.brewery.id }],
      NOT: { id: beerPost.id },
    },
  });

  return { beerRecommendations, count };
};

/**
 * Service for editing a beer post by ID.
 *
 * @param params - The parameters object for editing the beer post.
 * @param params.beerPostId - The ID of the beer post to edit.
 * @param params.body - The updated data for the beer post.
 * @param params.body.abv - The updated ABV (Alcohol By Volume) of the beer.
 * @param params.body.description - The updated description of the beer.
 * @param params.body.ibu - The updated IBU (International Bitterness Units) of the beer.
 * @param params.body.name - The updated name of the beer.
 * @returns - A promise that resolves to the updated beer post.
 */
export const editBeerPostByIdService: EditBeerPostById = async ({
  body: { abv, description, ibu, name },
  beerPostId,
}) => {
  return DBClient.instance.beerPost.update({
    where: { id: beerPostId },
    data: { abv, description, ibu, name },
    select: beerPostSelect,
  });
};

/**
 * Service for deleting a beer post by ID.
 *
 * @param params - The parameters object for deleting the beer post.
 * @param params.beerPostId - The ID of the beer post to delete.
 * @returns - A promise that resolves to the deleted beer post.
 */
export const deleteBeerPostByIdService: FindOrDeleteBeerPostById = async ({
  beerPostId,
}) => {
  return DBClient.instance.beerPost.delete({
    where: { id: beerPostId },
    select: beerPostSelect,
  });
};
