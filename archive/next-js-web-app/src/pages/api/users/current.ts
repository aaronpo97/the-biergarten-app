import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import { sendCurrentUser } from '@/controllers/users/auth';

const router = createRouter<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(getCurrentUser, sendCurrentUser);

const handler = router.handler(NextConnectOptions);
export default handler;
