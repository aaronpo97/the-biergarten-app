import BeerPostQueryResult from '@/services/posts/beer-post/schema/BeerPostQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

type BeerPostQueryResultT = z.infer<typeof BeerPostQueryResult>;
type APIResponse = z.infer<typeof APIResponseValidationSchema>;

export type SendCreateBeerPostRequest = (data: {
  body: {
    abv: number;
    description: string;
    ibu: number;
    name: string;
  };
  styleId: string;
  breweryId: string;
}) => Promise<BeerPostQueryResultT>;

export type SendDeleteBeerPostRequest = (args: {
  beerPostId: string;
}) => Promise<APIResponse>;

export type SendEditBeerPostRequest = (args: {
  beerPostId: string;
  body: {
    abv: number;
    description: string;
    ibu: number;
    name: string;
  };
}) => Promise<APIResponse>;
