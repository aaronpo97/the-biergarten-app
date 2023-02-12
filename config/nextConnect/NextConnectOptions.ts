import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { RequestHandler } from 'next-connect/dist/types/node';
import type { HandlerOptions } from 'next-connect/dist/types/types';
import { z } from 'zod';
import logger from '../pino/logger';

import ServerError from '../util/ServerError';

type NextConnectOptionsT = HandlerOptions<
  RequestHandler<
    NextApiRequest,
    NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
  >
>;

const NextConnectOptions: NextConnectOptionsT = {
  onNoMatch(req, res) {
    res.status(405).json({
      message: 'Method not allowed.',
      statusCode: 405,
      success: false,
    });
  },
  onError(error, req, res) {
    if (process.env.NODE_ENV !== 'production') {
      logger.error(error);
    }

    const message = error instanceof Error ? error.message : 'Internal server error.';
    const statusCode = error instanceof ServerError ? error.statusCode : 500;
    res.status(statusCode).json({
      message,
      statusCode,
      success: false,
    });
  },
};

export default NextConnectOptions;
