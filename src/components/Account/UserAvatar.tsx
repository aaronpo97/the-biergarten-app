import { FC } from 'react';
import { CldImage } from 'next-cloudinary';
import { z } from 'zod';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
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
      className="h-32 w-full bg-primary mask mask-circle flex items-center justify-center"
      aria-label="Default user avatar"
      role="img"
    >
      <span className="text-2xl font-bold text-base-content h-full">
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
      className="h-full w-full object-cover mask mask-circle"
    />
  );
};

export default UserAvatar;
