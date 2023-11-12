import { FC } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import GetUserSchema from '@/services/User/schema/GetUserSchema';

interface UserAvatarProps {
  user: {
    username: z.infer<typeof GetUserSchema>['username'];
    userAvatar: z.infer<typeof GetUserSchema>['userAvatar'];
    id: z.infer<typeof GetUserSchema>['id'];
  };
}

const UserAvatar: FC<UserAvatarProps> = ({ user }) => {
  const { userAvatar } = user;
  return !userAvatar ? null : (
    <Image
      src={userAvatar.path}
      alt="user avatar"
      width={1000}
      height={1000}
      className="h-full w-full"
    />
  );
};

export default UserAvatar;
