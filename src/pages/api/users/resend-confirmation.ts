import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import sendConfirmationEmail from '@/services/User/sendConfirmationEmail';

const resendConfirmation = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse,
) => {
  const user = req.user!;

  await sendConfirmationEmail(user);
  res.status(200).json({
    message: `Resent the confirmation email for ${user.username}.`,
    statusCode: 200,
    success: true,
  });
};

const router = createRouter<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(getCurrentUser, resendConfirmation);

const handler = router.handler(NextConnectOptions);
export default handler;
