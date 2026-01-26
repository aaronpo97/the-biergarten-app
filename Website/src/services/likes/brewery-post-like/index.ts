import DBClient from '@/prisma/DBClient';

import {
  CreateBreweryPostLike,
  FindBreweryPostLike,
  GetBreweryPostLikeCount,
  RemoveBreweryPostLike,
} from './types';

/**
 * Creates a new brewery post like.
 *
 * @param params - The parameters object for creating the brewery post like.
 * @param params.breweryPostId - The ID of the brewery post.
 * @param params.likedById - The ID of the user who will like the brewery post.
 * @returns A promise that resolves to the newly created brewery post like.
 */
export const createBreweryPostLikeService: CreateBreweryPostLike = async ({
  breweryPostId,
  likedById,
}) =>
  DBClient.instance.breweryPostLike.create({
    data: {
      breweryPost: { connect: { id: breweryPostId } },
      likedBy: { connect: { id: likedById } },
    },
  });

/**
 * Retrieves a brewery post like by ID.
 *
 * @param params - The parameters object for retrieving the brewery post like.
 * @param params.breweryPostId - The ID of the brewery post.
 * @param params.likedById - The ID of the user who liked the brewery post.
 * @returns A promise that resolves to the brewery post like.
 */
export const findBreweryPostLikeService: FindBreweryPostLike = async ({
  breweryPostId,
  likedById,
}) =>
  DBClient.instance.breweryPostLike.findFirst({ where: { breweryPostId, likedById } });

/**
 * Removes a brewery post like.
 *
 * @param params - The parameters object for removing the brewery post like.
 * @param params.breweryPostLikeId - The ID of the brewery post like to remove.
 * @returns A promise that resolves to the removed brewery post like.
 */
export const removeBreweryPostLikeService: RemoveBreweryPostLike = async ({
  breweryPostLikeId,
}) => DBClient.instance.breweryPostLike.delete({ where: { id: breweryPostLikeId } });

/**
 * Retrieves the number of likes for a brewery post.
 *
 * @param params - The parameters object for retrieving the number of likes for a brewery
 * @param params.breweryPostId - The ID of the brewery post.
 * @returns A promise that resolves to the number of likes for a brewery post.
 */
export const getBreweryPostLikeCountService: GetBreweryPostLikeCount = async ({
  breweryPostId,
}) => DBClient.instance.breweryPostLike.count({ where: { breweryPostId } });
