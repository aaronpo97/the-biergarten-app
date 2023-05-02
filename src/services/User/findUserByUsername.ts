import DBClient from '../../prisma/DBClient';

const findUserByUsername = async (username: string) =>
  DBClient.instance.user.findFirst({
    where: { username },
    select: {
      id: true,
      username: true,
      hash: true,
    },
  });

export default findUserByUsername;
