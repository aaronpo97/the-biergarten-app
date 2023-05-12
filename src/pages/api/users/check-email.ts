import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import findUserByEmail from '@/services/User/findUserByEmail';

const CheckEmailRequestQuerySchema = z.object({
  email: z.string(),
});

interface CheckEmailRequestSchema extends NextApiRequest {
  query: z.infer<typeof CheckEmailRequestQuerySchema>;
}

const router = createRouter<
  CheckEmailRequestSchema,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

const checkEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email: emailToCheck } = req.query;

  const email = await findUserByEmail(emailToCheck as string);

  res.json({
    success: true,
    payload: { emailIsTaken: !!email },
    statusCode: 200,
    message: 'Getting username availability.',
  });
};

router.get(
  validateRequest({ querySchema: z.object({ email: z.string().email() }) }),
  checkEmail,
);

const handler = router.handler(NextConnectOptions);

export default handler;
