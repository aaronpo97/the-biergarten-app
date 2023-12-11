import DBClient from '@/prisma/DBClient';
import {
  CreateNewBeerStyleComment,
  GetAllBeerStyleComments,
  GetBeerStyleCommentCount,
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

export const getAllBeerStyleComments: GetAllBeerStyleComments = ({
  beerStyleId,
  pageNum,
  pageSize,
}) => {
  return DBClient.instance.beerStyleComment.findMany({
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
    where: { beerStyleId },
    orderBy: { createdAt: 'desc' },
    select: beerStyleCommentSelect,
  });
};

export const getBeerStyleCommentCount: GetBeerStyleCommentCount = ({ beerStyleId }) => {
  return DBClient.instance.beerStyleComment.count({ where: { beerStyleId } });
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
