import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';
import { z } from 'zod';
import BreweryPostLikeSchema from '../schema/BreweryPostLikeSchema';

type User = z.infer<typeof GetUserSchema>;
type ReturnSchema = z.infer<typeof BreweryPostLikeSchema>;

export type CreateBreweryPostLike = (args: {
  breweryPostId: string;
  likedById: User['id'];
}) => Promise<ReturnSchema>;

export type FindBreweryPostLike = (args: {
  breweryPostId: string;
  likedById: User['id'];
}) => Promise<ReturnSchema | null>;

export type RemoveBreweryPostLike = (args: {
  breweryPostLikeId: string;
}) => Promise<ReturnSchema>;

export type GetBreweryPostLikeCount = (args: {
  breweryPostId: string;
}) => Promise<number>;
