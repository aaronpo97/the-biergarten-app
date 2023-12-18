import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';

import { z } from 'zod';
import BeerPostLikeSchema from '../schema/BeerPostLikeSchema';

type User = z.infer<typeof GetUserSchema>;
type ReturnSchema = z.infer<typeof BeerPostLikeSchema>;

export type CreateBeerPostLike = (args: {
  beerPostId: string;
  likedById: User['id'];
}) => Promise<ReturnSchema>;

export type FindBeerPostLikeById = (args: {
  beerPostId: string;
  likedById: User['id'];
}) => Promise<ReturnSchema | null>;

export type RemoveBeerPostLike = (args: {
  beerPostLikeId: string;
}) => Promise<ReturnSchema>;

export type GetBeerPostLikeCount = (args: { beerPostId: string }) => Promise<number>;
