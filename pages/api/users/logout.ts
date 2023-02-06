import { getLoginSession } from '@/config/auth/session';
import { removeTokenCookie } from '@/config/auth/cookie';
import NextConnectConfig from '@/config/nextConnect/NextConnectConfig';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { z } from 'zod';
import ServerError from '@/config/util/ServerError';

const handler = nextConnect<
  NextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>(NextConnectConfig).all(async (req, res) => {
  const session = await getLoginSession(req);

  if (!session) {
    throw new ServerError('You are not logged in.', 400);
  }

  removeTokenCookie(res);
  res.status(200).json({
    message: 'Logged out.',
    statusCode: 200,
    success: true,
  });
});
export default handler;
