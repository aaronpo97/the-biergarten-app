import useMediaQuery from '@/hooks/utilities/useMediaQuery';
import useTimeDistance from '@/hooks/utilities/useTimeDistance';
import findUserById from '@/services/User/findUserById';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import { format } from 'date-fns';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { FC } from 'react';
import { z } from 'zod';
import Image from 'next/image';

interface UserInfoPageProps {
  user: z.infer<typeof GetUserSchema>;
}

const UserHeader: FC<{ user: z.infer<typeof GetUserSchema> }> = ({ user }) => {
  const timeDistance = useTimeDistance(new Date(user.createdAt));

  return (
    <article className="card flex flex-col justify-center bg-base-300">
      <div className="card-body">
        <header className="flex justify-between">
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold lg:text-4xl">
                {user.firstName} {user.lastName}
              </h1>

              <h3 className="italic">
                joined{' '}
                {timeDistance && (
                  <span
                    className="tooltip tooltip-bottom"
                    data-tip={format(new Date(user.createdAt), 'MM/dd/yyyy')}
                  >
                    {`${timeDistance} ago`}
                  </span>
                )}
              </h3>
            </div>
          </div>
        </header>
      </div>
    </article>
  );
};

const UserInfoPage: FC<UserInfoPageProps> = ({ user }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return (
    <>
      <Head>
        <title>{user ? `${user.firstName} ${user.lastName}` : 'User Info'}</title>
        <meta name="description" content="User information" />
      </Head>
      <>
        <main className="mb-12 mt-10 flex w-full items-center justify-center">
          <Image src={user.userAvatar!.path} alt="avatar" width={200} height={200} />
          <div className="w-11/12 space-y-3 xl:w-9/12 2xl:w-8/12">
            <UserHeader user={user} />

            {isDesktop ? <></> : <> </>}
          </div>
        </main>
      </>
    </>
  );
};

export default UserInfoPage;

export const getServerSideProps: GetServerSideProps<UserInfoPageProps> = async (
  context,
) => {
  const { id } = context.params!;
  const user = await findUserById(id as string);

  if (!user) {
    return { notFound: true };
  }

  return { props: { user: JSON.parse(JSON.stringify(user)) } };
};
