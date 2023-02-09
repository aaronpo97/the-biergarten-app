import ServerError from '@/config/util/ServerError';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';

/**
 * Middleware to validate the request body and/or query against a zod schema.
 *
 * @example
 *   const handler = nextConnect(NextConnectConfig).post(
 *     validateRequest({ bodySchema: BeerPostValidationSchema }),
 *     getCurrentUser,
 *     createBeerPost,
 *   );
 *
 * @param args
 * @param args.bodySchema The body schema to validate against.
 * @param args.querySchema The query schema to validate against.
 * @throws ServerError with status code 400 if the request body or query is invalid.
 */
const validateRequest =
  ({
    bodySchema,
    querySchema,
  }: {
    bodySchema?: z.ZodSchema<any>;
    querySchema?: z.ZodSchema<any>;
  }) =>
  async (req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
    if (bodySchema) {
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ServerError('Invalid request body.', 400);
      }
    }

    if (querySchema) {
      const parsed = querySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ServerError('Invalid request query.', 400);
      }
      req.query = parsed.data;
    }

    next();
  };

export default validateRequest;
