import { Container, Heading, Text, Button, Section } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

import { FC } from 'react';

interface ResetPasswordEmailProps {
  name?: string;
  url?: string;
}

const ResetPasswordEmail: FC<ResetPasswordEmailProps> = ({ name, url }) => {
  return (
    <Tailwind>
      <Container className="mx-auto">
        <Section className="flex flex-col items-center justify-center p-4">
          <Heading className="text-2xl font-bold">Forgot Password</Heading>
          <Text className="my-4">Hi {name},</Text>
          <Text className="my-4">
            We received a request to reset your password. To proceed, please click the
            button below:
          </Text>
          <Button
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Reset Password
          </Button>
          <Text className="my-4">
            If you did not request a password reset, please ignore this email.
          </Text>
        </Section>
      </Container>
    </Tailwind>
  );
};

export default ResetPasswordEmail;
