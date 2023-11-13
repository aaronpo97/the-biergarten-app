import useMediaQuery from '@/hooks/utilities/useMediaQuery';
import useTimeDistance from '@/hooks/utilities/useTimeDistance';
import findUserById from '@/services/User/findUserById';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import { format } from 'date-fns';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { FC } from 'react';
import { z } from 'zod';
import UserAvatar from '@/components/Account/UserAvatar';
import useGetUsersFollowedByUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowedByUser';
import useGetUsersFollowingUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowingUser';

interface UserInfoPageProps {
  user: z.infer<typeof GetUserSchema>;
}

const UserHeader: FC<{ user: z.infer<typeof GetUserSchema> }> = ({ user }) => {
  const timeDistance = useTimeDistance(new Date(user.createdAt));

  const { followingCount } = useGetUsersFollowedByUser({
    userId: user.id,
    pageSize: 10,
  });

  const { followerCount } = useGetUsersFollowingUser({
    userId: user.id,
    pageSize: 10,
  });

  return (
    <header className="card text-center items-center">
      <div className="card-body items-center w-full">
        <div className="w-40 h-40">
          <UserAvatar user={user} />
        </div>

        <div>
          <h1 className="text-2xl font-bold lg:text-4xl">{user.username}</h1>
        </div>

        <div className="flex space-x-3 text-lg font-bold">
          <span>{followingCount} Following</span>
          <span>{followerCount} Followers</span>
        </div>

        <span className="italic">
          joined{' '}
          {timeDistance && (
            <span
              className="tooltip tooltip-bottom"
              data-tip={format(new Date(user.createdAt), 'MM/dd/yyyy')}
            >
              {`${timeDistance} ago`}
            </span>
          )}
        </span>
      </div>
    </header>
  );
};

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
          <div className="w-11/12 space-y-3 xl:w-9/12 2xl:w-8/12">
            <UserHeader user={user} />
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
