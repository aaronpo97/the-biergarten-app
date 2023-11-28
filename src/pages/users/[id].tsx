import useMediaQuery from '@/hooks/utilities/useMediaQuery';
import findUserById from '@/services/User/findUserById';
import GetUserSchema from '@/services/User/schema/GetUserSchema';

import Head from 'next/head';
import { FC } from 'react';
import { z } from 'zod';
import withPageAuthRequired from '@/util/withPageAuthRequired';
import UserHeader from '@/components/UserPage/UserHeader';

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
        <main className="mb-12 mt-10 flex w-full items-center justify-center">
          <div className="h-full w-11/12 space-y-3 xl:w-9/12 2xl:w-8/12">
            <UserHeader user={user} />

            {isDesktop ? (
              <div className="h-64 flex space-x-3">
                <div className="h-full w-5/12">
                  <div className="h-full card">
                    <div className="card-body">
                      <h2 className="text-2xl font-bold">About Me</h2>
                      <p>{user.bio}</p>
                    </div>
                  </div>
                </div>

                <div className="w-7/12">
                  <div className="h-full card">
                    <div className="h-full card-body"></div>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
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
    const user = await findUserById(id as string);
    return user
      ? { props: { user: JSON.parse(JSON.stringify(user)) } }
      : { notFound: true };
  },
);
