import useFollowStatus from '@/hooks/data-fetching/user-follows/useFollowStatus';
import useGetUsersFollowedByUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowedByUser';
import useGetUsersFollowingUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowingUser';
import sendUserFollowRequest from '@/requests/UserFollow/sendUserFollowRequest';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import { FC, useState } from 'react';
import { FaUserCheck, FaUserPlus } from 'react-icons/fa';
import { z } from 'zod';

interface UserFollowButtonProps {
  mutateFollowerCount: ReturnType<typeof useGetUsersFollowingUser>['mutate'];
  mutateFollowingCount: ReturnType<typeof useGetUsersFollowedByUser>['mutate'];
  user: z.infer<typeof GetUserSchema>;
}

const UserFollowButton: FC<UserFollowButtonProps> = ({
  user,
  mutateFollowerCount,
  mutateFollowingCount,
}) => {
  const { isFollowed, mutate: mutateFollowStatus } = useFollowStatus(user.id);

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      await sendUserFollowRequest(user.id);
      await Promise.all([
        mutateFollowStatus(),
        mutateFollowerCount(),
        mutateFollowingCount(),
      ]);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn-sm btn gap-2 rounded-2xl lg:btn-md ${
        !isFollowed ? 'btn-ghost outline' : 'btn-primary'
      }`}
      onClick={() => {
        onClick();
      }}
      disabled={isLoading}
    >
      {isFollowed ? (
        <>
          <FaUserCheck className="text-xl" />
          Followed
        </>
      ) : (
        <>
          <FaUserPlus className="text-xl" />
          Follow
        </>
      )}
    </button>
  );
};

export default UserFollowButton;
