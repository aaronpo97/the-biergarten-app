import DBClient from '@/prisma/DBClient';

const getBreweryCommentById = async (id: string) => {
  return DBClient.instance.breweryComment.findUnique({
    where: { id },
  });
};

export default getBreweryCommentById;
