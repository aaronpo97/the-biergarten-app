import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { editUserInfo, deleteAccount } from '@/controllers/users/auth';
import { checkIfUserCanEditUser } from '@/controllers/users/profile';
import { EditUserRequest } from '@/controllers/users/profile/types';
import EditUserSchema from '@/services/users/auth/schema/EditUserSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  EditUserRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.put(
  getCurrentUser,
  validateRequest({
    bodySchema: EditUserSchema,
    querySchema: z.object({ id: z.string().cuid() }),
  }),
  checkIfUserCanEditUser,
  editUserInfo,
);

router.delete(
  getCurrentUser,
  validateRequest({
    querySchema: z.object({ id: z.string().cuid() }),
  }),
  checkIfUserCanEditUser,
  deleteAccount,
);

const handler = router.handler(NextConnectOptions);

export default handler;
