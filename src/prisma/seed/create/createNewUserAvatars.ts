import { User } from '@prisma/client';
import DBClient from '../../DBClient';
import imageUrls from '../util/imageUrls';

interface CreateNewUserAvatarsArgs {
  joinData: { users: User[] };
}
interface UserAvatarData {
  path: string;
  alt: string;
  caption: string;
  userId: string;
  createdAt: Date;
}

const createNewUserAvatars = async ({
  joinData: { users },
}: CreateNewUserAvatarsArgs) => {
  const userAvatars: UserAvatarData[] = [];

  const path = imageUrls[Math.floor(Math.random() * imageUrls.length)];
  users.forEach((user) => {
    userAvatars.push({
      path,
      alt: `${user.firstName} ${user.lastName}`,
      caption: `${user.firstName} ${user.lastName}`,
      userId: user.id,
      createdAt: new Date(),
    });
  });

  await DBClient.instance.userAvatar.createMany({ data: userAvatars });
  return DBClient.instance.userAvatar.findMany({
    where: { user: { role: { not: 'ADMIN' } } },
  });
};

export default createNewUserAvatars;
