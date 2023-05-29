import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { verifyConfirmationToken } from '@/config/jwt';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import ServerError from '@/config/util/ServerError';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import updateUserToBeConfirmedById from '@/services/User/updateUserToBeConfirmedById';

const ConfirmUserValidationSchema = z.object({ token: z.string() });

interface ConfirmUserRequest extends UserExtendedNextApiRequest {
  query: z.infer<typeof ConfirmUserValidationSchema>;
}

const confirmUser = async (req: ConfirmUserRequest, res: NextApiResponse) => {
  const { token } = req.query;

  const user = req.user!;
  const { id } = await verifyConfirmationToken(token);

  if (user.accountIsVerified) {
    throw new ServerError('Your account is already verified.', 400);
  }

  if (user.id !== id) {
    throw new ServerError('Could not confirm user.', 401);
  }

  await updateUserToBeConfirmedById(id);

  res.status(200).json({
    message: 'User confirmed successfully.',
    statusCode: 200,
    success: true,
  });
};

const router = createRouter<
  ConfirmUserRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  getCurrentUser,
  validateRequest({ querySchema: ConfirmUserValidationSchema }),
  confirmUser,
);

const handler = router.handler(NextConnectOptions);

export default handler;
