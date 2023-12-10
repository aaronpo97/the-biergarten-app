import UpdateProfileSchema from '@/services/users/User/schema/UpdateProfileSchema';
import { z } from 'zod';

interface UpdateProfileRequestParams {
  userId: string;
  bio: z.infer<typeof UpdateProfileSchema>['bio'];
}

const sendUpdateUserProfileRequest = async ({
  bio,
  userId,
}: UpdateProfileRequestParams) => {
  const response = await fetch(`/api/users/${userId}/profile/update-profile`, {
    method: 'PUT',
    body: JSON.stringify({ bio }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to update profile.');
  }

  const json = await response.json();

  return json;
};

export default sendUpdateUserProfileRequest;
