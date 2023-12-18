import { z } from 'zod';
import BreweryPostQueryResult from '../schema/BreweryPostQueryResult';
import CreateNewBreweryPostWithoutLocationSchema from '../schema/CreateNewBreweryPostWithoutLocationSchema';
import BreweryPostMapQueryResult from '../schema/BreweryPostMapQueryResult';

export type CreateNewBreweryPost = (
  args: z.infer<typeof CreateNewBreweryPostWithoutLocationSchema>,
) => Promise<z.infer<typeof BreweryPostQueryResult>>;

export type GetAllBreweryPosts = (args: {
  pageNum: number;
  pageSize: number;
}) => Promise<{
  breweryPosts: z.infer<typeof BreweryPostQueryResult>[];
  count: number;
}>;

export type GetBreweryPostById = (args: {
  breweryPostId: string;
}) => Promise<z.infer<typeof BreweryPostQueryResult> | null>;

export type GetAllBreweryPostsByPostedById = (args: {
  pageNum: number;
  pageSize: number;
  postedById: string;
}) => Promise<{
  breweryPosts: z.infer<typeof BreweryPostQueryResult>[];
  count: number;
}>;

export type CreateBreweryPostLocation = (args: {
  body: {
    address: string;
    city: string;
    country?: string;
    stateOrProvince?: string;
    coordinates: [number, number];
  };
  postedById: string;
}) => Promise<{ id: string }>;

export type GetMapBreweryPosts = (args: {
  pageNum: number;
  pageSize: number;
}) => Promise<{
  breweryPosts: z.infer<typeof BreweryPostMapQueryResult>[];
  count: number;
}>;

export type UpdateBreweryPost = (args: {
  breweryPostId: string;
  body: {
    name: string;
    description: string;
    dateEstablished: Date;
  };
}) => Promise<z.infer<typeof BreweryPostQueryResult>>;
