import withPageAuthRequired from '@/util/withPageAuthRequired';
import { GetServerSideProps, NextPage } from 'next';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import createErrorToast from '@/util/createErrorToast';

import UserAvatar from '@/components/Account/UserAvatar';
import { useContext, useEffect } from 'react';
import UserContext from '@/contexts/UserContext';

import useGetUsersFollowedByUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowedByUser';
import useGetUsersFollowingUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowingUser';
import Head from 'next/head';

import UpdateProfileSchema from '../../services/User/schema/UpdateProfileSchema';
import sendUpdateProfileRequest from '../../requests/Account/sendUpdateProfileRequest';
import UpdateProfileForm from '../../components/Account/UpdateProfileForm';

const ProfilePage: NextPage = () => {
  const { user, mutate: mutateUser } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,

    reset,
  } = useForm<z.infer<typeof UpdateProfileSchema>>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      bio: user?.bio ?? '',
    },
  });

  useEffect(() => {
    if (!user || !user.bio) return;
    setValue('bio', user.bio);
  }, [user, setValue]);

  const onSubmit: SubmitHandler<z.infer<typeof UpdateProfileSchema>> = async (data) => {
    try {
      await sendUpdateProfileRequest(data);
      const loadingToast = toast.loading('Updating profile...');
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      toast.remove(loadingToast);
      reset();
      mutateUser!();
      toast.success('Profile updated!');
    } catch (error) {
      createErrorToast(error);
    }
  };
  const { followingCount } = useGetUsersFollowedByUser({
    userId: user?.id,
  });

  const { followerCount } = useGetUsersFollowingUser({
    userId: user?.id,
  });

  const getUserAvatarPath = () => {
    const watchedInput = watch('userAvatar');

    if (
      !(watchedInput instanceof FileList) ||
      watchedInput.length !== 1 ||
      !watchedInput[0].type.startsWith('image/')
    ) {
      return '';
    }

    const [avatar] = watchedInput;

    return URL.createObjectURL(avatar);
  };

  return (
    <>
      <Head>
        <title>The Biergarten App || Update Your Profile</title>
        <meta name="description" content="Update your user profile." />
      </Head>
      <div className="mt-20 flex flex-col items-center justify-center">
        {user && (
          <div className="w-10/12 lg:w-7/12">
            <div className="card">
              <div className="card-body">
                <div className="my-10 flex flex-col items-center justify-center">
                  <div className="my-5 h-52">
                    <UserAvatar
                      user={{
                        ...user,
                        userAvatar:
                          // Render the user's avatar if they have one and then switch to the preview it's being updated.
                          user.userAvatar && !getUserAvatarPath()
                            ? user.userAvatar
                            : {
                                id: 'preview',
                                alt: 'User Avatar',
                                caption: 'User Avatar',
                                path: getUserAvatarPath(),
                                createdAt: new Date(),
                                updatedAt: new Date(),
                              },
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-bold">{user.username}</h2>

                    <div className="flex space-x-3 text-lg font-bold">
                      <span>{followingCount} Following</span>
                      <span>{followerCount} Followers</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-lg">
                      {watch('bio') || (
                        <span className="italic">Your bio will appear here.</span>
                      )}
                    </p>
                  </div>
                </div>

                <UpdateProfileForm
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  register={register}
                  user={user}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;

export const getServerSideProps: GetServerSideProps = withPageAuthRequired();
