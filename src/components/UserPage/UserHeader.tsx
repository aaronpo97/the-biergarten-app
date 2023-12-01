import useTimeDistance from '@/hooks/utilities/useTimeDistance';

import { FC, useContext } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import useGetUsersFollowedByUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowedByUser';
import useGetUsersFollowingUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowingUser';
import UserContext from '@/contexts/UserContext';
import Link from 'next/link';
import UserAvatar from '../Account/UserAvatar';
import UserFollowButton from './UserFollowButton';

interface UserHeaderProps {
  user: z.infer<typeof GetUserSchema>;
}
const UserHeader: FC<UserHeaderProps> = ({ user }) => {
  const timeDistance = useTimeDistance(new Date(user.createdAt));

  const { followingCount, mutate: mutateFollowingCount } = useGetUsersFollowedByUser({
    userId: user.id,
    pageSize: 10,
  });

  const { followerCount, mutate: mutateFollowerCount } = useGetUsersFollowingUser({
    userId: user.id,
    pageSize: 10,
  });

  const { user: currentUser } = useContext(UserContext);

  return (
    <header className="card items-center text-center">
      <div className="card-body w-full items-center">
        <div className="h-40 w-40">
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
        <div className="w-6/12">
          <p className="text-sm">{user.bio}</p>
        </div>

        {currentUser?.id !== user.id ? (
          <div className="flex items-center justify-center">
            <UserFollowButton
              mutateFollowerCount={mutateFollowerCount}
              user={user}
              mutateFollowingCount={mutateFollowingCount}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Link href={`/account/profile`} className="btn btn-primary">
              Edit Profile
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default UserHeader;
