import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { singleUploadMiddleware } from '@/config/multer/uploadMiddleware';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';

import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import GetUserSchema from '@/services/User/schema/GetUserSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler, createRouter } from 'next-connect';
import { z } from 'zod';

interface UpdateProfileRequest extends UserExtendedNextApiRequest {
  file: Express.Multer.File;
  body: {
    bio: string;
  };
}

interface UpdateUserProfileByIdParams {
  id: string;
  data: {
    avatar: {
      alt: string;
      path: string;
      caption: string;
    };
  };
}

const updateUserAvatarById = async ({ id, data }: UpdateUserProfileByIdParams) => {
  const user: z.infer<typeof GetUserSchema> = await DBClient.instance.user.update({
    where: { id },
    data: {
      userAvatar: data.avatar
        ? {
            upsert: {
              create: {
                alt: data.avatar.alt,
                path: data.avatar.path,
                caption: data.avatar.caption,
              },
              update: {
                alt: data.avatar.alt,
                path: data.avatar.path,
                caption: data.avatar.caption,
              },
            },
          }
        : undefined,
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

const updateProfile = async (req: UpdateProfileRequest, res: NextApiResponse) => {
  const { file, user } = req;

  await updateUserAvatarById({
    id: user!.id,
    data: {
      avatar: { alt: file.originalname, path: file.path, caption: '' },
    },
  });
  res.status(200).json({
    message: 'User avatar updated successfully.',
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
  checkIfUserCanUpdateProfile,
  // @ts-expect-error
  singleUploadMiddleware,
  updateProfile,
);

const handler = router.handler();

export default handler;
export const config = { api: { bodyParser: false } };
