import DBClient from '../../prisma/DBClient';

const findUserByEmail = async (email: string) =>
  DBClient.instance.user.findFirst({
    where: { email },
    select: {
      id: true,
      username: true,
      hash: true,
    },
  });

export default findUserByEmail;
