import { UserExtendedNextApiRequest } from '@/config/auth/types';

export interface LikeRequest extends UserExtendedNextApiRequest {
  query: { postId: string };
}
