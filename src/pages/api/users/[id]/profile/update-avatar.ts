import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { singleUploadMiddleware } from '@/config/multer/uploadMiddleware';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';

import ServerError from '@/config/util/ServerError';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler, createRouter } from 'next-connect';
import { z } from 'zod';
import updateUserAvatarById, {
  UpdateUserAvatarByIdParams,
} from '@/services/UserAccount/UpdateUserAvatarByIdParams';

interface UpdateProfileRequest extends UserExtendedNextApiRequest {
  file: Express.Multer.File;
  body: {
    bio: string;
  };
}

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

const updateAvatar = async (req: UpdateProfileRequest, res: NextApiResponse) => {
  const { file, user } = req;

  const avatar: UpdateUserAvatarByIdParams['data']['avatar'] = {
    alt: file.originalname,
    path: file.path,
    caption: '',
  };

  await updateUserAvatarById({ id: user!.id, data: { avatar } });
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
  updateAvatar,
);

const handler = router.handler();

export default handler;
export const config = { api: { bodyParser: false } };
