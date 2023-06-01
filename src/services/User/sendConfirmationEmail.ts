import { generateConfirmationToken } from '@/config/jwt';
import sendEmail from '@/config/sparkpost/sendEmail';

import Welcome from '@/emails/Welcome';
import { render } from '@react-email/render';
import { z } from 'zod';
import { BASE_URL } from '@/config/env';
import { ReactElement } from 'react';
import GetUserSchema from './schema/GetUserSchema';

type UserSchema = z.infer<typeof GetUserSchema>;

const sendConfirmationEmail = async ({ id, username, email }: UserSchema) => {
  const confirmationToken = generateConfirmationToken({ id, username });

  const subject = 'Confirm your email';
  const name = username;
  const url = `${BASE_URL}/users/confirm?token=${confirmationToken}`;
  const address = email;

  const component = Welcome({ name, url, subject })! as ReactElement<unknown, string>;

  const html = render(component);
  const text = render(component, { plainText: true });

  await sendEmail({ address, subject, text, html });
};

export default sendConfirmationEmail;
