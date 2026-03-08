import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';
import { z } from 'zod';

import BeerStyleLikeSchema from '../schema/BeerStyleLikeSchema';

type User = z.infer<typeof GetUserSchema>;
type ReturnSchema = z.infer<typeof BeerStyleLikeSchema>;

export type CreateBeerStyleLike = (args: {
  beerStyleId: string;
  likedById: User['id'];
}) => Promise<ReturnSchema>;

export type FindBeerStyleLike = (args: {
  beerStyleId: string;
  likedById: User['id'];
}) => Promise<ReturnSchema | null>;

export type RemoveBeerStyleLike = (args: {
  beerStyleLikeId: string;
}) => Promise<ReturnSchema>;

export type GetBeerStyleLikeCount = (args: { beerStyleId: string }) => Promise<number>;
