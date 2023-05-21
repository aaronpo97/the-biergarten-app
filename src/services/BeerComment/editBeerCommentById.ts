import DBClient from '@/prisma/DBClient';

interface EditBeerCommentByIdArgs {
  id: string;
  content: string;
  rating: number;
}

const editBeerCommentById = async ({ id, content, rating }: EditBeerCommentByIdArgs) => {
  const updated = await DBClient.instance.beerComment.update({
    where: { id },
    data: {
      content,
      rating,
      updatedAt: new Date(),
    },
  });

  return updated;
};

export default editBeerCommentById;
