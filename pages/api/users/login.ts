import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import NextConnectConfig from '@/config/nextConnect/NextConnectConfig';
import passport from 'passport';
import nextConnect from 'next-connect';
import localStrat from '@/config/auth/localStrat';
import { setLoginSession } from '@/config/auth/session';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import ServerError from '@/config/util/ServerError';
import LoginValidationSchema from '@/services/User/schema/LoginValidationSchema';
import { UserExtendedNextApiRequest } from '../../../config/auth/types';

export default nextConnect<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>(NextConnectConfig)
  .use(passport.initialize())
  .use((req, res, next) => {
    const parsed = LoginValidationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ServerError('Username and password are required.', 400);
    }
    passport.use(localStrat);
    passport.authenticate('local', { session: false }, (error, token) => {
      if (error) {
        next(error);
      } else {
        req.user = token;
        next();
      }
    })(req, res, next);
  })
  .post(async (req, res) => {
    const user = req.user!;
    await setLoginSession(res, user);

    res.status(200).json({
      message: 'Login successful.',
      payload: user,
      statusCode: 200,
      success: true,
    });
  });
