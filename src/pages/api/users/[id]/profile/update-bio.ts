import { UserExtendedNextApiRequest } from '@/config/auth/types';

import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import GetUserSchema from '@/services/User/schema/GetUserSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler, createRouter } from 'next-connect';
import { z } from 'zod';

interface UpdateProfileRequest extends UserExtendedNextApiRequest {
  body: { bio: string };
}

interface UpdateUserProfileByIdParams {
  id: string;
  data: { bio: string };
}

const updateUserProfileById = async ({ id, data }: UpdateUserProfileByIdParams) => {
  const user: z.infer<typeof GetUserSchema> = await DBClient.instance.user.update({
    where: { id },
    data: { bio: data.bio },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      userAvatar: true,
      accountIsVerified: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      updatedAt: true,
      dateOfBirth: true,
      role: true,
    },
  });

  return user;
};

const updateProfile = async (req: UpdateProfileRequest, res: NextApiResponse) => {
  const user = req.user!;
  const { body } = req;

  await updateUserProfileById({ id: user!.id, data: { bio: body.bio } });

  res.status(200).json({
    message: 'Profile updated successfully.',
    statusCode: 200,
    success: true,
  });
};

const checkIfUserCanUpdateProfile = async (
  req: UpdateProfileRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const user = req.user!;

  if (user.id !== req.query.id) {
    throw new ServerError('You can only update your own profile.', 403);
  }

  await next();
};

const router = createRouter<
  UpdateProfileRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.put(
  getCurrentUser,
  checkIfUserCanUpdateProfile,
  validateRequest({ bodySchema: z.object({ bio: z.string().max(1000) }) }),
  updateProfile,
);

const handler = router.handler();

export default handler;
