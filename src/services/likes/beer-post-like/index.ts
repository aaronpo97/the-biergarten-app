import DBClient from '@/prisma/DBClient';
import {
  CreateBeerPostLike,
  FindBeerPostLikeById,
  GetBeerPostLikeCount,
  RemoveBeerPostLike,
} from './types';

/**
 * Creates a new beer post like.
 *
 * @param params - The parameters object for creating the beer post like.
 * @param params.beerPostId - The ID of the beer post.
 * @param params.likedById - The ID of the user who will like the beer post.
 * @returns A promise that resolves to the newly created beer post like.
 */
export const createBeerPostLikeService: CreateBeerPostLike = async ({
  beerPostId,
  likedById,
}) =>
  DBClient.instance.beerPostLike.create({
    data: {
      beerPost: { connect: { id: beerPostId } },
      likedBy: { connect: { id: likedById } },
    },
  });

/**
 * Retrieves a beer post like by ID.
 *
 * @param params - The parameters object for retrieving the beer post like.
 * @param params.beerPostId - The ID of the beer post.
 * @param params.likedById - The ID of the user who liked the beer post.
 * @returns A promise that resolves to the beer post like.
 */
export const findBeerPostLikeByIdService: FindBeerPostLikeById = async ({
  beerPostId,
  likedById,
}) => DBClient.instance.beerPostLike.findFirst({ where: { beerPostId, likedById } });

/**
 * Removes a beer post like.
 *
 * @param params - The parameters object for removing the beer post like.
 * @param params.beerPostLikeId - The ID of the beer post like to remove.
 * @returns A promise that resolves to the removed beer post like.
 */
export const removeBeerPostLikeService: RemoveBeerPostLike = async ({ beerPostLikeId }) =>
  DBClient.instance.beerPostLike.delete({ where: { id: beerPostLikeId } });

/**
 * Retrieves the number of likes for a beer post.
 *
 * @param params - The parameters object for retrieving the number of likes for a beer
 *   post.
 * @param params.beerPostId - The ID of the beer post.
 * @returns A promise that resolves to the number of likes for a beer post.
 */
export const getBeerPostLikeCountService: GetBeerPostLikeCount = async ({ beerPostId }) =>
  DBClient.instance.beerPostLike.count({ where: { beerPostId } });
