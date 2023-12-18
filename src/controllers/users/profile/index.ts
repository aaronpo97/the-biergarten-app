import ServerError from '@/config/util/ServerError';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import { NextHandler } from 'next-connect';

import { UserExtendedNextApiRequest } from '@/config/auth/types';

import { findUserByIdService } from '@/services/users/auth';

import {
  createUserFollow,
  deleteUserFollow,
  findUserFollow,
  getUsersFollowedByUser,
  getUsersFollowingUser,
  updateUserAvatar,
  updateUserProfileById,
} from '@/services/users/profile';
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

  const user = await findUserByIdService({ userId: id });
  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const currentUser = req.user!;
  const userIsFollowedBySessionUser = await findUserFollow({
    followerId: currentUser.id,
    followingId: id,
  });

  if (!userIsFollowedBySessionUser) {
    await createUserFollow({ followerId: currentUser.id, followingId: id });
    res.status(200).json({
      message: 'Now following user.',
      success: true,
      statusCode: 200,
    });

    return;
  }

  await deleteUserFollow({ followerId: currentUser.id, followingId: id });

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

  const user = await findUserByIdService({ userId: id });
  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const pageNum = parseInt(page_num, 10);
  const pageSize = parseInt(page_size, 10);

  const { follows, count } = await getUsersFollowingUser({
    userId: id,
    pageNum,
    pageSize,
  });

  res.setHeader('X-Total-Count', count);

  res.json({
    message: 'Retrieved users that are followed by queried user',
    payload: follows,
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

  const user = await findUserByIdService({ userId: id });
  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const pageNum = parseInt(page_num, 10);
  const pageSize = parseInt(page_size, 10);

  const { follows, count } = await getUsersFollowedByUser({
    userId: id,
    pageNum,
    pageSize,
  });

  res.setHeader('X-Total-Count', count);

  res.json({
    message: 'Retrieved users that are followed by queried user',
    payload: follows,
    success: true,
    statusCode: 200,
  });
};

export const checkIfUserIsFollowedBySessionUser = async (
  req: GetUserFollowInfoRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const user = await findUserByIdService({ userId: id });
  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const currentUser = req.user!;

  const userFollow = await findUserFollow({
    followerId: currentUser.id,
    followingId: id,
  });

  const isFollowed = !!userFollow;

  res.status(200).json({
    message: isFollowed
      ? 'User is followed by the session user.'
      : 'User is not followed by the session user.',
    success: true,
    statusCode: 200,
    payload: { isFollowed },
  });
};

export const checkIfUserCanEditUser = async (
  req: EditUserRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const authenticatedUser = req.user!;

  const userToUpdate = await findUserByIdService({ userId: req.query.id });
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

  await updateUserAvatar({
    userId: user!.id,
    data: { alt: file.originalname, path: file.path, caption: '' },
  });
  res.status(200).json({
    message: 'User avatar updated successfully.',
    statusCode: 200,
    success: true,
  });
};

export const updateProfile = async (req: UpdateProfileRequest, res: NextApiResponse) => {
  const user = req.user!;
  const { body } = req;

  await updateUserProfileById({ userId: user!.id, data: { bio: body.bio } });

  res.status(200).json({
    message: 'Profile updated successfully.',
    statusCode: 200,
    success: true,
  });
};
