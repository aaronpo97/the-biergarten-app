import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import findUserById from '@/services/users/auth/findUserById';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import { NextHandler } from 'next-connect';
import updateUserAvatarById, {
  UpdateUserAvatarByIdParams,
} from '@/services/users/account/UpdateUserAvatarByIdParams';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import updateUserProfileById from '@/services/users/auth/updateUserProfileById';
import getUsersFollowingUser from '@/services/users/follows/getUsersFollowingUser';
import getUsersFollowedByUser from '@/services/users/follows/getUsersFollowedByUser';
import {
  UserRouteRequest,
  GetUserFollowInfoRequest,
  EditUserRequest,
  UpdateAvatarRequest,
  UpdateProfileRequest,
} from './types';

export const followUser = async (
  req: UserRouteRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const user = await findUserById(id);
  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const currentUser = req.user!;
  const userIsFollowedBySessionUser = await DBClient.instance.userFollow.findFirst({
    where: {
      followerId: currentUser.id,
      followingId: id,
    },
  });

  if (!userIsFollowedBySessionUser) {
    await DBClient.instance.userFollow.create({
      data: { followerId: currentUser.id, followingId: id },
    });

    res.status(200).json({
      message: 'Now following user.',
      success: true,
      statusCode: 200,
    });

    return;
  }

  await DBClient.instance.userFollow.delete({
    where: {
      followerId_followingId: {
        followerId: currentUser.id,
        followingId: id,
      },
    },
  });

  res.status(200).json({
    message: 'No longer following user.',
    success: true,
    statusCode: 200,
  });
};

export const getUserFollowers = async (
  req: GetUserFollowInfoRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { id, page_num, page_size } = req.query;

  const user = await findUserById(id);
  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const pageNum = parseInt(page_num, 10);
  const pageSize = parseInt(page_size, 10);

  const following = await getUsersFollowingUser({
    userId: id,
    pageNum,
    pageSize,
  });
  const followingCount = await DBClient.instance.userFollow.count({
    where: { following: { id } },
  });

  res.setHeader('X-Total-Count', followingCount);

  res.json({
    message: 'Retrieved users that are followed by queried user',
    payload: following,
    success: true,
    statusCode: 200,
  });
};

export const getUsersFollowed = async (
  req: GetUserFollowInfoRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { id, page_num, page_size } = req.query;

  const user = await findUserById(id);
  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const pageNum = parseInt(page_num, 10);
  const pageSize = parseInt(page_size, 10);

  const following = await getUsersFollowedByUser({
    userId: id,
    pageNum,
    pageSize,
  });
  const followingCount = await DBClient.instance.userFollow.count({
    where: { follower: { id } },
  });

  res.setHeader('X-Total-Count', followingCount);

  res.json({
    message: 'Retrieved users that are followed by queried user',
    payload: following,
    success: true,
    statusCode: 200,
  });
};

export const checkIfUserIsFollowedBySessionUser = async (
  req: GetUserFollowInfoRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const user = await findUserById(id);
  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const currentUser = req.user!;

  const userIsFollowedBySessionUser = await DBClient.instance.userFollow.findFirst({
    where: { followerId: currentUser.id, followingId: id },
  });

  if (!userIsFollowedBySessionUser) {
    res.status(200).json({
      message: 'User is not followed by the current user.',
      success: true,
      statusCode: 200,
      payload: { isFollowed: false },
    });

    return;
  }

  res.status(200).json({
    message: 'User is followed by the current user.',
    success: true,
    statusCode: 200,
    payload: { isFollowed: true },
  });
};

export const checkIfUserCanEditUser = async (
  req: EditUserRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const authenticatedUser = req.user!;

  const userToUpdate = await findUserById(req.query.id);
  if (!userToUpdate) {
    throw new ServerError('User not found', 404);
  }

  if (authenticatedUser.id !== userToUpdate.id) {
    throw new ServerError('You are not permitted to modify this user', 403);
  }

  return next();
};

export const checkIfUserCanUpdateProfile = async <T extends UserExtendedNextApiRequest>(
  req: T,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const user = req.user!;

  if (user.id !== req.query.id) {
    throw new ServerError('You can only update your own profile.', 403);
  }

  await next();
};

export const updateAvatar = async (req: UpdateAvatarRequest, res: NextApiResponse) => {
  const { file, user } = req;

  const avatar: UpdateUserAvatarByIdParams['data']['avatar'] = {
    alt: file.originalname,
    path: file.path,
    caption: '',
  };

  await updateUserAvatarById({ id: user!.id, data: { avatar } });
  res.status(200).json({
    message: 'User avatar updated successfully.',
    statusCode: 200,
    success: true,
  });
};

export const updateProfile = async (req: UpdateProfileRequest, res: NextApiResponse) => {
  const user = req.user!;
  const { body } = req;

  await updateUserProfileById({ id: user!.id, data: { bio: body.bio } });

  res.status(200).json({
    message: 'Profile updated successfully.',
    statusCode: 200,
    success: true,
  });
};
