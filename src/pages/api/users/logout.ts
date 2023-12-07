import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import { logoutUser } from '@/controllers/users/auth';

const router = createRouter<
  NextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.all(logoutUser);

const handler = router.handler(NextConnectOptions);
export default handler;
