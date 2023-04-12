import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import passport from 'passport';
import { createRouter, expressWrapper } from 'next-connect';
import localStrat from '@/config/auth/localStrat';
import { setLoginSession } from '@/config/auth/session';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import LoginValidationSchema from '@/services/User/schema/LoginValidationSchema';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import GetUserSchema from '@/services/User/schema/GetUserSchema';

const router = createRouter<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ bodySchema: LoginValidationSchema }),
  expressWrapper(async (req, res, next) => {
    passport.initialize();
    passport.use(localStrat);
    passport.authenticate(
      'local',
      { session: false },
      (error: unknown, token: z.infer<typeof GetUserSchema>) => {
        if (error) {
          next(error);
          return;
        }
        req.user = token;
        next();
      },
    )(req, res, next);
  }),
  async (req, res) => {
    const user = req.user!;
    await setLoginSession(res, user);

    res.status(200).json({
      message: 'Login successful.',
      payload: user,
      statusCode: 200,
      success: true,
    });
  },
);

const handler = router.handler(NextConnectOptions);
export default handler;
