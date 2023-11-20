import useTimeDistance from '@/hooks/utilities/useTimeDistance';
import useGetUsersFollowedByUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowedByUser';
import useGetUsersFollowingUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowingUser';
import { FC } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import UserAvatar from '../Account/UserAvatar';

interface UserHeaderProps {
  user: z.infer<typeof GetUserSchema>;
  followerCount: ReturnType<typeof useGetUsersFollowingUser>['followerCount'];
  followingCount: ReturnType<typeof useGetUsersFollowedByUser>['followingCount'];
}
const UserHeader: FC<UserHeaderProps> = ({ user, followerCount, followingCount }) => {
  const timeDistance = useTimeDistance(new Date(user.createdAt));

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

export default UserHeader;
