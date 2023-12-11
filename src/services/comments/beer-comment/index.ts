import DBClient from '@/prisma/DBClient';

import {
  CreateBeerPostComment,
  EditBeerPostCommentById,
  FindOrDeleteBeerPostCommentById,
  GetAllBeerPostComments,
  GetBeerPostCommentCount,
} from './types';

const beerPostCommentSelect = {
  id: true,
  content: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
  postedBy: {
    select: { id: true, username: true, createdAt: true, userAvatar: true },
  },
} as const;

export const createBeerPostCommentService: CreateBeerPostComment = ({
  body,
  beerPostId,
  userId,
}) => {
  const { content, rating } = body;
  return DBClient.instance.beerComment.create({
    data: {
      content,
      rating,
      beerPost: { connect: { id: beerPostId } },
      postedBy: { connect: { id: userId } },
    },
    select: beerPostCommentSelect,
  });
};

export const editBeerPostCommentByIdService: EditBeerPostCommentById = ({
  beerPostCommentId,
  body,
}) => {
  const { content, rating } = body;
  return DBClient.instance.beerComment.update({
    where: { id: beerPostCommentId },
    data: { content, rating, updatedAt: new Date() },
    select: beerPostCommentSelect,
  });
};

export const getBeerPostCommentByIdService: FindOrDeleteBeerPostCommentById = ({
  beerPostCommentId,
}) => {
  return DBClient.instance.beerComment.findUnique({
    where: { id: beerPostCommentId },
    select: beerPostCommentSelect,
  });
};

export const deleteBeerCommentByIdService: FindOrDeleteBeerPostCommentById = ({
  beerPostCommentId,
}) => {
  return DBClient.instance.beerComment.delete({
    where: { id: beerPostCommentId },
    select: beerPostCommentSelect,
  });
};

export const getAllBeerCommentsService: GetAllBeerPostComments = ({
  beerPostId,
  pageNum,
  pageSize,
}) => {
  return DBClient.instance.beerComment.findMany({
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
    where: { beerPostId },
    orderBy: { createdAt: 'desc' },
    select: beerPostCommentSelect,
  });
};

export const getBeerPostCommentCountService: GetBeerPostCommentCount = ({
  beerPostId,
}) => {
  return DBClient.instance.beerComment.count({ where: { beerPostId } });
};
