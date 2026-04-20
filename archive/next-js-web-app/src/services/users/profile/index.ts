import DBClient from '@/prisma/DBClient';
import ServerError from '@/config/util/ServerError';
import {
  GetUsersFollowedByOrFollowingUser,
  UpdateUserAvatar,
  UpdateUserProfileById,
  UserFollowService,
} from './types';

/**
 * The select object for retrieving users.
 *
 * Satisfies the GetUserSchema zod schema.
 *
 * @example
 *   const users = await DBClient.instance.user.findMany({
 *     select: userSelect,
 *   });
 */
const userSelect = {
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  createdAt: true,
  accountIsVerified: true,
  updatedAt: true,
  role: true,
  userAvatar: true,
  bio: true,
} as const;

/**
 * Finds a user follow by the followerId and followingId.
 *
 * @returns The user follow if found, otherwise null.
 */
export const findUserFollow: UserFollowService = ({ followerId, followingId }) => {
  return DBClient.instance.userFollow.findFirst({ where: { followerId, followingId } });
};

/**
 * Creates a new user follow.
 *
 * @param args The arguments for service.
 * @param args.followerId The follower id of the user follow to create.
 * @param args.followingId The following id of the user follow to create.
 * @returns The user follow.
 */
export const createUserFollow: UserFollowService = ({ followerId, followingId }) => {
  return DBClient.instance.userFollow.create({ data: { followerId, followingId } });
};

/**
 * Deletes a user follow.
 *
 * @param args The arguments for service.
 * @param args.followerId The follower id of the user follow to delete.
 * @param args.followingId The following id of the user follow to delete.
 * @returns The user follow.
 */
export const deleteUserFollow: UserFollowService = ({ followerId, followingId }) => {
  return DBClient.instance.userFollow.delete({
    where: { followerId_followingId: { followerId, followingId } },
  });
};

/**
 * Gets the users followed by the session user.
 *
 * @param args The arguments for service.
 * @param args.userId The id of the user to check if followed by the session user.
 * @param args.pageNum The page number of the users to retrieve.
 * @param args.pageSize The page size of the users to retrieve.
 * @returns The users followed by the queried user and the count of users followed by the
 *   queried user.
 */
export const getUsersFollowedByUser: GetUsersFollowedByOrFollowingUser = async ({
  userId,
  pageNum,
  pageSize,
}) => {
  const usersFollowedByQueriedUser = await DBClient.instance.userFollow.findMany({
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    where: { follower: { id: userId } },
    select: {
      follower: { select: { username: true, userAvatar: true, id: true } },
    },
  });
  const count = await DBClient.instance.userFollow.count({
    where: { follower: { id: userId } },
  });
  const follows = usersFollowedByQueriedUser.map((u) => u.follower);

  return { follows, count };
};

/**
 * Gets the users following the session user.
 *
 * @param args The arguments for service.
 * @param args.userId The id of the user to check if followed by the session user.
 * @param args.pageNum The page number of the users to retrieve.
 * @param args.pageSize The page size of the users to retrieve.
 */
export const getUsersFollowingUser: GetUsersFollowedByOrFollowingUser = async ({
  userId,
  pageNum,
  pageSize,
}) => {
  const usersFollowingQueriedUser = await DBClient.instance.userFollow.findMany({
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    where: { following: { id: userId } },
    select: {
      following: { select: { username: true, userAvatar: true, id: true } },
    },
  });

  const count = await DBClient.instance.userFollow.count({
    where: { following: { id: userId } },
  });

  const follows = usersFollowingQueriedUser.map((u) => u.following);
  return { follows, count };
};

/**
 * Updates the user avatar of the user.
 *
 * @param args The arguments for service.
 * @param args.userId The id of the user to update the avatar of.
 * @param args.data The data to update the user avatar with.
 * @param args.data.alt The alt text of the user avatar.
 * @param args.data.path The path of the user avatar.
 * @param args.data.caption The caption of the user avatar.
 * @returns The updated user.
 */
export const updateUserAvatar: UpdateUserAvatar = async ({ userId, data }) => {
  const user = await DBClient.instance.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const updatedUser = await DBClient.instance.user.update({
    where: { id: userId },
    data: {
      userAvatar: {
        upsert: {
          create: {
            alt: data.alt,
            path: data.path,
            caption: data.caption,
          },
          update: {
            alt: data.alt,
            path: data.path,
            caption: data.caption,
          },
        },
      },
    },
    select: userSelect,
  });

  return updatedUser;
};

/**
 * Updates a user's profile by id.
 *
 * @param args The arguments for service.
 * @param args.userId The id of the user to update.
 * @param args.data The data to update the user with.
 * @param args.data.bio The bio of the user.
 * @returns The user.
 */
export const updateUserProfileById: UpdateUserProfileById = async ({ userId, data }) => {
  const user = await DBClient.instance.user.update({
    where: { id: userId },
    data: { bio: data.bio },
    select: userSelect,
  });

  return user;
};
