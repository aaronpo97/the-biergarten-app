import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const sendCurrentUser = async (req: UserExtendedNextApiRequest, res: NextApiResponse) => {
  const { user } = req;
  res.status(200).json({
    message: `Currently logged in as ${user!.username}`,
    statusCode: 200,
    success: true,
    payload: user,
  });
};

const router = createRouter<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(getCurrentUser, sendCurrentUser);

const handler = router.handler(NextConnectOptions);
export default handler;
