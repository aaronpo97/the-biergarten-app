import { NextApiRequest, NextApiResponse } from 'next';
import ServerError from '../util/ServerError';

const NextConnectOptions = {
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({
      message: 'Method not allowed.',
      statusCode: 405,
      success: false,
    });
  },
  onError(error: unknown, req: NextApiRequest, res: NextApiResponse) {
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
