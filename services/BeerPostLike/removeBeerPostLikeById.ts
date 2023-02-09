import DBClient from '@/prisma/DBClient';

const removeBeerPostLikeById = async (id: string) => {
  return DBClient.instance.beerPostLike.delete({
    where: {
      id,
    },
  });
};

export default removeBeerPostLikeById;
