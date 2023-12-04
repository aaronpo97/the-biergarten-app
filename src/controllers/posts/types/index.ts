import { NextApiRequest } from 'next';

export interface GetAllPostsRequest extends NextApiRequest {
  query: { page_size: string; page_num: string };
}
