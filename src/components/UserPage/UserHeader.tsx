import useTimeDistance from '@/hooks/utilities/useTimeDistance';

import { FC } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import useGetUsersFollowedByUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowedByUser';
import useGetUsersFollowingUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowingUser';
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
        <div className="w-6/12">
          <p className="text-sm">{user.bio}</p>
        </div>
        <div className="h-20 flex items-center justify-center">
          <UserFollowButton
            mutateFollowerCount={mutateFollowerCount}
            user={user}
            mutateFollowingCount={mutateFollowingCount}
          />
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
