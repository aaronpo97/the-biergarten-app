import useMediaQuery from '@/hooks/utilities/useMediaQuery';

import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';

import Head from 'next/head';
import { FC } from 'react';
import { z } from 'zod';
import withPageAuthRequired from '@/util/withPageAuthRequired';
import UserHeader from '@/components/UserPage/UserHeader';
import { findUserByIdService } from '@/services/users/auth';

interface UserInfoPageProps {
  user: z.infer<typeof GetUserSchema>;
}

const UserInfoPage: FC<UserInfoPageProps> = ({ user }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const title = `${user.username} | The Biergarten App`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="User information" />
      </Head>
      <>
        <main className="mb-12 mt-10 flex w-full flex-col items-center justify-center">
          <div className="w-11/12 space-y-3 xl:w-9/12 2xl:w-8/12">
            <UserHeader user={user} />
          </div>
        </main>
      </>
    </>
  );
};

export default UserInfoPage;

export const getServerSideProps = withPageAuthRequired<UserInfoPageProps>(
  async (context) => {
    const { id } = context.params!;
    const user = await findUserByIdService({ userId: id as string });
    return user
      ? { props: { user: JSON.parse(JSON.stringify(user)) } }
      : { notFound: true };
  },
);
