import { singleUploadMiddleware } from '@/config/multer/uploadMiddleware';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { checkIfUserCanUpdateProfile, updateAvatar } from '@/controllers/users/profile';
import { UpdateProfileRequest } from '@/controllers/users/profile/types';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

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
