import { FC } from 'react';
import { CldImage } from 'next-cloudinary';
import { z } from 'zod';
import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';
import { FaUser } from 'react-icons/fa';

interface UserAvatarProps {
  user: {
    username: z.infer<typeof GetUserSchema>['username'];
    userAvatar: z.infer<typeof GetUserSchema>['userAvatar'];
    id: z.infer<typeof GetUserSchema>['id'];
  };
}

const UserAvatar: FC<UserAvatarProps> = ({ user }) => {
  const { userAvatar } = user;
  return !userAvatar ? (
    <div
      className="mask mask-circle flex h-32 w-full items-center justify-center bg-primary"
      aria-label="Default user avatar"
      role="img"
    >
      <span className="h-full text-2xl font-bold text-base-content">
        <FaUser className="h-full" />
      </span>
    </div>
  ) : (
    <CldImage
      src={userAvatar.path}
      alt="user avatar"
      width={1000}
      height={1000}
      crop="fill"
      className="mask mask-circle h-full w-full object-cover"
    />
  );
};

export default UserAvatar;
