import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { singleUploadMiddleware } from '@/config/multer/uploadMiddleware';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import GetUserSchema from '@/services/User/schema/GetUserSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface UpdateProfileRequest extends UserExtendedNextApiRequest {
  file?: Express.Multer.File;
  body: {
    bio: string;
  };
}

interface UpdateUserProfileByIdParams {
  id: string;
  data: {
    bio: string;
    avatar: {
      alt: string;
      path: string;
      caption: string;
    };
  };
}

const updateUserProfileById = async ({ id, data }: UpdateUserProfileByIdParams) => {
  const { alt, path, caption } = data.avatar;
  const user: z.infer<typeof GetUserSchema> = await DBClient.instance.user.update({
    where: { id },
    data: {
      bio: data.bio,
      userAvatar: {
        upsert: { create: { alt, path, caption }, update: { alt, path, caption } },
      },
    },
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
  const { file, body, user } = req;

  if (!file) {
    throw new Error('No file uploaded');
  }

  await updateUserProfileById({
    id: user!.id,
    data: {
      bio: body.bio,
      avatar: { alt: file.originalname, path: file.path, caption: '' },
    },
  });
  res.status(200).json({
    message: 'User confirmed successfully.',
    statusCode: 200,
    success: true,
  });
};

const router = createRouter<
  UpdateProfileRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.put(
  getCurrentUser,
  // @ts-expect-error
  singleUploadMiddleware,

  validateRequest({ bodySchema: z.object({ bio: z.string().max(1000) }) }),
  updateProfile,
);

const handler = router.handler();

export default handler;
export const config = { api: { bodyParser: false } };
