import { z } from 'zod';
import UpdateProfileSchema from '@/services/User/schema/UpdateProfileSchema';

const sendUpdateProfileRequest = async (data: z.infer<typeof UpdateProfileSchema>) => {
  if (!(data.userAvatar instanceof FileList)) {
    throw new Error('You must submit this form in a web browser.');
  }

  const { bio, userAvatar } = data;

  const formData = new FormData();
  if (userAvatar[0]) {
    formData.append('image', userAvatar[0]);
  }

  formData.append('bio', bio);

  const response = await fetch(`/api/users/profile`, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Something went wrong.');
  }

  const updatedUser = await response.json();

  return updatedUser;
};

export default sendUpdateProfileRequest;
