import { generateResetPasswordToken } from '@/config/jwt';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import sendEmail from '@/config/sparkpost/sendEmail';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import DBClient from '@/prisma/DBClient';
import { render } from '@react-email/render';
import ForgotEmail from '@/emails/ForgotEmail';
import { ReactElement } from 'react';

import { User } from '@prisma/client';
import { BASE_URL } from '@/config/env';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';

interface ResetPasswordRequest extends NextApiRequest {
  body: { email: string };
}

const sendResetPasswordEmail = async (user: User) => {
  const token = generateResetPasswordToken({ id: user.id, username: user.username });

  const url = `${BASE_URL}/users/reset-password?token=${token}`;

  const component = ForgotEmail({ name: user.username, url })! as ReactElement<
    unknown,
    string
  >;

  const html = render(component);
  const text = render(component, { plainText: true });

  await sendEmail({
    address: user.email,
    subject: 'Reset Password',
    html,
    text,
  });
};

const forgetPassword = async (
  req: ResetPasswordRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { email } = req.body;

  const user = await DBClient.instance.user.findUnique({
    where: { email },
  });

  if (user) {
    await sendResetPasswordEmail(user);
  }

  res.status(200).json({
    statusCode: 200,
    success: true,
    message:
      'If an account with that email exists, we have sent you an email to reset your password.',
  });
};

const router = createRouter<
  ResetPasswordRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ bodySchema: z.object({ email: z.string().email() }) }),
  forgetPassword,
);

const handler = router.handler(NextConnectOptions);
export default handler;
