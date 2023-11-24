import { Container, Heading, Text, Button, Section } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

import { FC } from 'react';

interface ForgotEmailProps {
  name?: string;
  url?: string;
}

const ForgotEmail: FC<ForgotEmailProps> = ({ name, url }) => {
  return (
    <Tailwind>
      <Container className="mx-auto">
        <Section className="p-4 flex flex-col justify-center items-center">
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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

export default ForgotEmail;
