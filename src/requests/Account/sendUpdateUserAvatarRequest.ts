interface UpdateProfileRequestParams {
  file: File;
  userId: string;
}

const sendUpdateUserAvatarRequest = async ({
  file,
  userId,
}: UpdateProfileRequestParams) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/users/${userId}/`, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to update profile.');
  }

  const json = await response.json();

  return json;
};

export default sendUpdateUserAvatarRequest;
