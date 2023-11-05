import useTimeDistance from '@/hooks/utilities/useTimeDistance';
import findUserById from '@/services/User/findUserById';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import { format } from 'date-fns';
import { GetServerSideProps } from 'next';
import { FC } from 'react';
import { z } from 'zod';

interface UserInfoPageProps {
  user: z.infer<typeof GetUserSchema>;
}

const UserInfoPage: FC<UserInfoPageProps> = ({ user }) => {
  const timeDistance = useTimeDistance(new Date(user.createdAt));
  return (
    <div>
      <h1>
        {user.firstName} {user.lastName}
      </h1>
      <h2 className="italic">
        joined{' '}
        <time
          className="tooltip tooltip-bottom"
          data-tip={format(new Date(user.createdAt), 'MM/dd/yyyy')}
        >
          {timeDistance}
        </time>{' '}
        ago
      </h2>
    </div>
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
