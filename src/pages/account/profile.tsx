import FormError from '@/components/ui/forms/FormError';
import FormInfo from '@/components/ui/forms/FormInfo';
import FormLabel from '@/components/ui/forms/FormLabel';
import FormSegment from '@/components/ui/forms/FormSegment';
import FormTextInput from '@/components/ui/forms/FormTextInput';
import findUserById from '@/services/User/findUserById';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import withPageAuthRequired from '@/util/withPageAuthRequired';
import { GetServerSideProps, NextPage } from 'next';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import createErrorToast from '@/util/createErrorToast';
import Button from '@/components/ui/forms/Button';

interface ProfilePageProps {
  user: z.infer<typeof GetUserSchema>;
}

const UpdateProfileSchema = z.object({
  bio: z.string().min(1, 'Bio cannot be empty'),
  userAvatar: z
    .instanceof(typeof FileList !== 'undefined' ? FileList : Object)
    .refine((fileList) => fileList instanceof FileList, {
      message: 'You must submit this form in a web browser.',
    })
    .refine((fileList) => (fileList as FileList).length === 1, {
      message: 'You must upload exactly one file.',
    })
    .refine(
      (fileList) =>
        [...(fileList as FileList)]
          .map((file) => file.type)
          .every((fileType) => fileType.startsWith('image/')),
      { message: 'You must upload only images.' },
    )
    .refine(
      (fileList) =>
        [...(fileList as FileList)]
          .map((file) => file.size)
          .every((fileSize) => fileSize < 15 * 1024 * 1024),
      { message: 'You must upload images smaller than 15MB.' },
    ),
});

const sendUpdateProfileRequest = async (data: z.infer<typeof UpdateProfileSchema>) => {
  if (!(data.userAvatar instanceof FileList)) {
    throw new Error('You must submit this form in a web browser.');
  }

  const { bio, userAvatar } = data;

  const formData = new FormData();
  formData.append('image', userAvatar[0]);
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

const ProfilePage: NextPage<ProfilePageProps> = ({ user }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reset,
  } = useForm<z.infer<typeof UpdateProfileSchema>>({
    resolver: zodResolver(UpdateProfileSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof UpdateProfileSchema>> = async (data) => {
    try {
      await sendUpdateProfileRequest(data);
      const loadingToast = toast.loading('Updating profile...');
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      toast.remove(loadingToast);
      // reset();
      toast.success('Profile updated!');
    } catch (error) {
      createErrorToast(error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-9/12">
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <form className="form-control" noValidate onSubmit={handleSubmit(onSubmit)}>
          <FormInfo>
            <FormLabel htmlFor="bio">Bio</FormLabel>
            <FormError>{errors.bio?.message}</FormError>
          </FormInfo>

          <FormSegment>
            <FormTextInput
              disabled={isSubmitting}
              id="bio"
              type="text"
              formValidationSchema={register('bio')}
              error={!!errors.bio}
              placeholder="Bio"
            />
          </FormSegment>

          <FormInfo>
            <FormLabel htmlFor="userAvatar">Avatar</FormLabel>
            <FormError>{errors.userAvatar?.message}</FormError>
          </FormInfo>
          <FormSegment>
            <input
              disabled={isSubmitting}
              type="file"
              id="userAvatar"
              className="file-input file-input-bordered w-full"
              {...register('userAvatar')}
            />
          </FormSegment>

          <div className="mt-6">
            <Button type="submit" isSubmitting={isSubmitting}>
              Update Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

export const getServerSideProps: GetServerSideProps =
  withPageAuthRequired<ProfilePageProps>(async (context, session) => {
    const { id } = session;

    const user = await findUserById(id);

    if (!user) {
      return { notFound: true };
    }

    return { props: { user: JSON.parse(JSON.stringify(user)) } };
  });
