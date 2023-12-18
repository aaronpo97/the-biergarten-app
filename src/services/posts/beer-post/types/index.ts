import { z } from 'zod';
import BeerPostQueryResult from '../schema/BeerPostQueryResult';
import EditBeerPostValidationSchema from '../schema/EditBeerPostValidationSchema';
import CreateBeerPostValidationSchema from '../schema/CreateBeerPostValidationSchema';

const CreateSchema = CreateBeerPostValidationSchema.extend({
  userId: z.string().cuid(),
});
const EditSchema = EditBeerPostValidationSchema.omit({ id: true });

type BeerPost = z.infer<typeof BeerPostQueryResult>;

export type CreateNewBeerPost = (args: z.infer<typeof CreateSchema>) => Promise<BeerPost>;

export type EditBeerPostById = (args: {
  beerPostId: string;
  body: z.infer<typeof EditSchema>;
}) => Promise<BeerPost>;

export type FindOrDeleteBeerPostById = (args: {
  beerPostId: string;
}) => Promise<BeerPost | null>;

export type GetAllBeerPosts = (args: { pageNum: number; pageSize: number }) => Promise<{
  beerPosts: BeerPost[];
  count: number;
}>;

export type GetAllBeerPostsByPostedById = (args: {
  postedById: string;
  pageSize: number;
  pageNum: number;
}) => Promise<{
  beerPosts: BeerPost[];
  count: number;
}>;

export type GetAllBeerPostsByStyleId = (args: {
  styleId: string;
  pageSize: number;
  pageNum: number;
}) => Promise<{
  beerPosts: BeerPost[];
  count: number;
}>;

export type GetAllBeerPostsByBreweryId = (args: {
  breweryId: string;
  pageSize: number;
  pageNum: number;
}) => Promise<{
  beerPosts: BeerPost[];
  count: number;
}>;

export type GetBeerRecommendations = (args: {
  beerPost: BeerPost;
  pageNum: number;
  pageSize: number;
}) => Promise<{ beerRecommendations: BeerPost[]; count: number }>;
