import { BASE_URL } from '@/config/env';
import { generateResetPasswordToken } from '@/config/jwt';
import sendEmail from '@/config/sparkpost/sendEmail';
import ForgotEmail from '@/emails/ForgotEmail';
import { User } from '@prisma/client';
import type { ReactElement } from 'react';
import { render } from '@react-email/render';

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

export default sendResetPasswordEmail;
