import { getLoginSession } from '@/config/auth/session';
import { removeTokenCookie } from '@/config/auth/cookie';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import ServerError from '@/config/util/ServerError';

const router = createRouter<
  NextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.all(async (req, res) => {
  const session = await getLoginSession(req);

  if (!session) {
    throw new ServerError('You are not logged in.', 400);
  }

  removeTokenCookie(res);

  res.redirect('/');
});

const handler = router.handler(NextConnectOptions);
export default handler;
