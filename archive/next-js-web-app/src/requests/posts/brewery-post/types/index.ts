import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import CreateBreweryPostSchema from '@/services/posts/brewery-post/schema/CreateBreweryPostSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

type APIResponse = z.infer<typeof APIResponseValidationSchema>;

export type SendDeleteBreweryPostRequest = (args: {
  breweryPostId: string;
}) => Promise<APIResponse>;

export type SendEditBreweryPostRequest = (args: {
  body: {
    name: string;
    description: string;
    dateEstablished: Date;
  };
  breweryPostId: string;
}) => Promise<APIResponse>;

export type SendCreateBreweryPostRequest = (args: {
  body: z.infer<typeof CreateBreweryPostSchema>;
}) => Promise<z.infer<typeof BreweryPostQueryResult>>;
