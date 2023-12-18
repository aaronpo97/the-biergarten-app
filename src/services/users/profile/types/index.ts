import { UserFollow } from '@prisma/client';
import { z } from 'zod';

import FollowInfoSchema from '../schema/FollowInfoSchema';
import GetUserSchema from '../../auth/schema/GetUserSchema';

type FollowInfo = z.infer<typeof FollowInfoSchema>;
type User = z.infer<typeof GetUserSchema>;

export type UserFollowService = (args: {
  followerId: string;
  followingId: string;
}) => Promise<UserFollow | null>;

export type UpdateUserProfileById = (args: {
  userId: string;
  data: { bio: string };
}) => Promise<User>;

export type CheckIfUserIsFollowedBySessionUser = (args: {
  followerId: string;
  followingId: string;
}) => Promise<boolean>;

export type GetUsersFollowedByOrFollowingUser = (args: {
  userId: string;
  pageNum: number;
  pageSize: number;
}) => Promise<{ follows: FollowInfo[]; count: number }>;

export type UpdateUserAvatar = (args: {
  userId: string;
  data: {
    alt: string;
    path: string;
    caption: string;
  };
}) => Promise<User>;
