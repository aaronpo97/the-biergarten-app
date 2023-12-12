import DBClient from '@/prisma/DBClient';
import {
  CreateNewBreweryComment,
  FindDeleteBreweryCommentById,
  GetAllBreweryComments,
  UpdateBreweryCommentById,
} from './types';

const breweryCommentSelect = {
  id: true,
  content: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
  postedBy: {
    select: { id: true, username: true, createdAt: true, userAvatar: true },
  },
} as const;

export const updateBreweryCommentById: UpdateBreweryCommentById = ({
  breweryCommentId,
  body,
}) => {
  const { content, rating } = body;

  return DBClient.instance.breweryComment.update({
    where: { id: breweryCommentId },
    data: { content, rating },
    select: breweryCommentSelect,
  });
};

export const createNewBreweryComment: CreateNewBreweryComment = ({
  body,
  breweryPostId,
  userId,
}) => {
  const { content, rating } = body;
  return DBClient.instance.breweryComment.create({
    data: {
      content,
      rating,
      breweryPost: { connect: { id: breweryPostId } },
      postedBy: { connect: { id: userId } },
    },
    select: breweryCommentSelect,
  });
};

export const getAllBreweryComments: GetAllBreweryComments = async ({
  id,
  pageNum,
  pageSize,
}) => {
  const comments = await DBClient.instance.breweryComment.findMany({
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
    where: { breweryPostId: id },
    select: breweryCommentSelect,
    orderBy: { createdAt: 'desc' },
  });

  const count = await DBClient.instance.breweryComment.count({
    where: { breweryPostId: id },
  });

  return { comments, count };
};

export const getBreweryCommentById: FindDeleteBreweryCommentById = ({
  breweryCommentId,
}) => {
  return DBClient.instance.breweryComment.findUnique({
    where: { id: breweryCommentId },
    select: breweryCommentSelect,
  });
};

export const deleteBreweryCommentByIdService: FindDeleteBreweryCommentById = ({
  breweryCommentId,
}) => {
  return DBClient.instance.breweryComment.delete({
    where: { id: breweryCommentId },
    select: breweryCommentSelect,
  });
};
