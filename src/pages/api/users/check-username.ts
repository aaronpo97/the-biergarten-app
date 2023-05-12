import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import findUserByUsername from '@/services/User/findUserByUsername';

const CheckUsernameRequestQuerySchema = z.object({
  username: z.string(),
});

interface CheckUsernameRequestSchema extends NextApiRequest {
  query: z.infer<typeof CheckUsernameRequestQuerySchema>;
}

const router = createRouter<
  CheckUsernameRequestSchema,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

const checkUsername = async (req: NextApiRequest, res: NextApiResponse) => {
  const { username: usernameToCheck } = req.query;

  const user = await findUserByUsername(usernameToCheck as string);

  res.json({
    success: true,
    payload: { usernameIsTaken: !!user },
    statusCode: 200,
    message: 'Getting username availability.',
  });
};

router.get(
  validateRequest({ querySchema: z.object({ username: z.string() }) }),
  checkUsername,
);

const handler = router.handler(NextConnectOptions);

export default handler;
