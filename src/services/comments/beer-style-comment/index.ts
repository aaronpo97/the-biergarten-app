import DBClient from '@/prisma/DBClient';
import {
  CreateNewBeerStyleComment,
  GetAllBeerStyleComments,
  UpdateBeerStyleCommentById,
  FindOrDeleteBeerStyleCommentById,
} from './types';

const beerStyleCommentSelect = {
  id: true,
  content: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
  postedBy: {
    select: { id: true, username: true, createdAt: true, userAvatar: true },
  },
} as const;

export const createNewBeerStyleComment: CreateNewBeerStyleComment = ({
  body,
  userId,
  beerStyleId,
}) => {
  const { content, rating } = body;
  return DBClient.instance.beerStyleComment.create({
    data: {
      content,
      rating,
      beerStyle: { connect: { id: beerStyleId } },
      postedBy: { connect: { id: userId } },
    },
    select: beerStyleCommentSelect,
  });
};

export const getAllBeerStyleComments: GetAllBeerStyleComments = async ({
  beerStyleId,
  pageNum,
  pageSize,
}) => {
  const comments = await DBClient.instance.beerStyleComment.findMany({
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
    where: { beerStyleId },
    orderBy: { createdAt: 'desc' },
    select: beerStyleCommentSelect,
  });

  const count = await DBClient.instance.beerStyleComment.count({
    where: { beerStyleId },
  });

  return { comments, count };
};

export const updateBeerStyleCommentById: UpdateBeerStyleCommentById = ({
  body,
  beerStyleCommentId,
}) => {
  const { content, rating } = body;

  return DBClient.instance.beerStyleComment.update({
    where: { id: beerStyleCommentId },
    data: { content, rating, updatedAt: new Date() },
    select: beerStyleCommentSelect,
  });
};

export const findBeerStyleCommentById: FindOrDeleteBeerStyleCommentById = ({
  beerStyleCommentId,
}) => {
  return DBClient.instance.beerStyleComment.findUnique({
    where: { id: beerStyleCommentId },
    select: beerStyleCommentSelect,
  });
};

export const deleteBeerStyleCommentById: FindOrDeleteBeerStyleCommentById = ({
  beerStyleCommentId,
}) => {
  return DBClient.instance.beerStyleComment.delete({
    where: { id: beerStyleCommentId },
    select: beerStyleCommentSelect,
  });
};
