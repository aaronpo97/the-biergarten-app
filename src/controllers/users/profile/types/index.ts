import { UserExtendedNextApiRequest } from '@/config/auth/types';
import EditUserSchema from '@/services/User/schema/EditUserSchema';
import { z } from 'zod';

export interface UserRouteRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}

export interface GetUserFollowInfoRequest extends UserExtendedNextApiRequest {
  query: { id: string; page_size: string; page_num: string };
}

export interface EditUserRequest extends UserRouteRequest {
  body: z.infer<typeof EditUserSchema>;
}

export interface UpdateAvatarRequest extends UserExtendedNextApiRequest {
  file: Express.Multer.File;
}

export interface UpdateProfileRequest extends UserExtendedNextApiRequest {
  body: { bio: string };
}
