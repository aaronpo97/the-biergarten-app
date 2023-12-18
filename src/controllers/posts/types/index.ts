import { NextApiRequest } from 'next';

/** Represents the request object for getting all posts. */
export interface GetAllPostsRequest extends NextApiRequest {
  query: { page_size: string; page_num: string };
}

/**
 * Represents the request object for getting all posts by a connected post ID.
 *
 * This may include:
 *
 * - All beers by a brewery ID
 * - All beers by a beer style ID
 * - All beer styles by a user ID
 * - And more...
 *
 * @example
 *   const getAllBeersByBeerStyle = async (
 *     req: GetAllPostsByConnectedPostId,
 *     res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
 *   ) => {
 *     const { page_size, page_num, id } = req.query;
 *     // ...
 *   };
 *
 * @example
 *   const getAllBeersByUserId = async (
 *     req: GetAllPostsByConnectedPostId,
 *     res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
 *   ) => {
 *     const { page_size, page_num, id } = req.query;
 *     // ...
 *   };
 */
export interface GetAllPostsByConnectedPostId extends NextApiRequest {
  query: { id: string; page_size: string; page_num: string };
}
