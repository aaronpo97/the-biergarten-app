import { Container, Heading, Text, Button, Section } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

import { FC } from 'react';

interface WelcomeEmail {
  subject?: string;
  name?: string;
  url?: string;
}

const Welcome: FC<WelcomeEmail> = ({ name, url }) => (
  <Tailwind>
    <Container className="flex h-full w-full flex-col items-center justify-center">
      <Section>
        <Heading className="text-2xl font-bold">Welcome to The Biergarten App!</Heading>

        <Text>
          Hi {name}, welcome to The Biergarten App! We are excited to have you as a member
          of our community.
        </Text>

        <Text>
          The Biergarten App is a social network for beer lovers. Here you can share your
          favorite beers with the community, and discover new ones. You can also create
          your own beer list, and share it with your friends.
        </Text>

        <Text>
          To get started, please verify your email address by clicking the button below.
          Once you do so, you will be able to create your profile and start sharing your
          favorite beers with the community.
        </Text>

        <Button href={url}>Verify Email</Button>

        <Text className="italic">
          Please note that this email was automatically generated, and we kindly ask you
          not to reply to it.
        </Text>
      </Section>
    </Container>
  </Tailwind>
);

export default Welcome;
