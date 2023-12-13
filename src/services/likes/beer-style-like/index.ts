import DBClient from '@/prisma/DBClient';

import {
  CreateBeerStyleLike,
  FindBeerStyleLike,
  GetBeerStyleLikeCount,
  RemoveBeerStyleLike,
} from './types';

/**
 * Creates a new beer style like.
 *
 * @param params - The parameters object for creating the beer style like.
 * @param params.beerStyleId - The ID of the beer style.
 * @param params.likedById - The ID of the user who will like the beer style.
 * @returns A promise that resolves to the newly created beer style like.
 */
export const createBeerStyleLikeService: CreateBeerStyleLike = async ({
  beerStyleId,
  likedById,
}) =>
  DBClient.instance.beerStyleLike.create({
    data: {
      beerStyle: { connect: { id: beerStyleId } },
      likedBy: { connect: { id: likedById } },
    },
  });

/**
 * Retrieves a beer style like by ID.
 *
 * @param params - The parameters object for retrieving the beer style like.
 * @param params.beerStyleId - The ID of the beer style.
 * @param params.likedById - The ID of the user who liked the beer style.
 * @returns A promise that resolves to the beer style like.
 */
export const findBeerStyleLikeService: FindBeerStyleLike = async ({
  beerStyleId,
  likedById,
}) => DBClient.instance.beerStyleLike.findFirst({ where: { beerStyleId, likedById } });

/**
 * Removes a beer style like.
 *
 * @param params - The parameters object for removing the beer style like.
 * @param params.beerStyleLikeId - The ID of the beer style like to remove.
 * @returns A promise that resolves to the removed beer style like.
 */
export const removeBeerStyleLikeService: RemoveBeerStyleLike = async ({
  beerStyleLikeId,
}) => DBClient.instance.beerStyleLike.delete({ where: { id: beerStyleLikeId } });

/**
 * Retrieves the number of likes for a beer style.
 *
 * @param params - The parameters object for retrieving the number of likes for a beer
 *   style.
 * @param params.beerStyleId - The ID of the beer style.
 * @returns A promise that resolves to the number of likes for a beer style.
 */
export const getBeerStyleLikeCountService: GetBeerStyleLikeCount = async ({
  beerStyleId,
}) => DBClient.instance.beerStyleLike.count({ where: { beerStyleId } });
