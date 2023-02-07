import NextConnectConfig from '@/config/nextConnect/NextConnectConfig';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import getCurrentUser from '@/config/auth/middleware/getCurrentUser';
import nextConnect from 'next-connect';
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

const handler = nextConnect<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>(NextConnectConfig).get(getCurrentUser, sendCurrentUser);

export default handler;
