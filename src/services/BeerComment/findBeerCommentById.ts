import DBClient from '@/prisma/DBClient';

const findBeerCommentById = async (id: string) => {
  const comment = await DBClient.instance.beerComment.findUnique({
    where: { id },
  });

  return comment;
};

export default findBeerCommentById;
