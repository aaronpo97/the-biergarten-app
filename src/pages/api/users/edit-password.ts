import { hashPassword } from '@/config/auth/passwordFns';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import { UpdatePasswordSchema } from '@/services/User/schema/CreateUserValidationSchemas';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface UpdatePasswordRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof UpdatePasswordSchema>;
}

const updatePassword = async (
  req: UpdatePasswordRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { password } = req.body;
  const hash = await hashPassword(password);

  const user = req.user!;
  const updatedUser: z.infer<typeof GetUserSchema> = await DBClient.instance.user.update({
    data: { hash },
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      createdAt: true,
      updatedAt: true,
      email: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      accountIsVerified: true,
    },
  });
  res.json({
    message: 'Updated user password.',
    statusCode: 200,
    success: true,
    payload: updatedUser,
  });
};
const router = createRouter<
  UpdatePasswordRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.put(
  validateRequest({ bodySchema: UpdatePasswordSchema }),
  getCurrentUser,
  updatePassword,
);

const handler = router.handler(NextConnectOptions);
export default handler;
