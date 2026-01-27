import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { checkIfUserCanUpdateProfile, updateProfile } from '@/controllers/users/profile';
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
  validateRequest({ bodySchema: z.object({ bio: z.string().max(1000) }) }),
  updateProfile,
);

const handler = router.handler();

export default handler;
