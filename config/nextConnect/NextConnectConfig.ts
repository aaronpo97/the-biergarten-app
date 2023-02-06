import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { Options } from 'next-connect';
import { z } from 'zod';
import logger from '../pino/logger';
import ServerError from '../util/ServerError';

const NextConnectConfig: Options<
  NextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
> = {
  onNoMatch(req, res) {
    res.status(405).json({
      message: 'Method not allowed.',
      statusCode: 405,
      success: false,
    });
  },
  onError(error, req, res) {
    logger.error(error);
    const message = error instanceof Error ? error.message : 'Internal server error.';
    const statusCode = error instanceof ServerError ? error.statusCode : 500;
    res.status(statusCode).json({
      message,
      statusCode,
      success: false,
    });
  },
};

export default NextConnectConfig;
