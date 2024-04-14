import { useContext, useEffect } from 'react';

import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import toast from 'react-hot-toast';

import withPageAuthRequired from '@/util/withPageAuthRequired';
import createErrorToast from '@/util/createErrorToast';

import UserContext from '@/contexts/UserContext';

import UserAvatar from '@/components/Account/UserAvatar';
import UpdateProfileForm from '@/components/Account/UpdateProfileForm';

import useGetUsersFollowedByUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowedByUser';
import useGetUsersFollowingUser from '@/hooks/data-fetching/user-follows/useGetUsersFollowingUser';

import UpdateProfileSchema from '@/services/users/auth/schema/UpdateProfileSchema';
import sendUpdateUserAvatarRequest from '@/requests/users/profile/sendUpdateUserAvatarRequest';
import sendUpdateUserProfileRequest from '@/requests/users/profile/sendUpdateUserProfileRequest';
import Spinner from '@/components/ui/Spinner';

const ProfilePage: NextPage = () => {
  const { user, mutate: mutateUser } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<z.infer<typeof UpdateProfileSchema>>({
    resolver: zodResolver(UpdateProfileSchema),
  });

  useEffect(() => {
    if (!user || !user.bio) {
      return;
    }

    setValue('bio', user.bio);
  }, [user, setValue]);

  const router = useRouter();

  const onSubmit: SubmitHandler<z.infer<typeof UpdateProfileSchema>> = async (data) => {
    try {
      const loadingToast = toast.loading('Updating profile...');
      if (!user) {
        throw new Error('User is not logged in.');
      }

      if (data.userAvatar instanceof FileList && data.userAvatar.length === 1) {
        await sendUpdateUserAvatarRequest({
          userId: user.id,
          file: data.userAvatar[0],
        });
      }

      await sendUpdateUserProfileRequest({
        userId: user.id,
        bio: data.bio,
      });

      toast.remove(loadingToast);
      await mutateUser!();
      await router.push(`/users/${user.id}`);
      toast.success('Profile updated.');
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
      !(
        watchedInput instanceof FileList &&
        watchedInput.length === 1 &&
        watchedInput[0].type.startsWith('image/')
      )
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
      <div className="my-20 flex flex-col items-center justify-center">
        {user ? (
          <div className="w-10/12 lg:w-7/12">
            <div className="card">
              <div className="card-body">
                <div className="my-10 flex flex-col items-center justify-center">
                  <div className="my-2 h-40 xl:my-5 xl:h-52">
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
                    <h2 className="my-1 text-2xl font-bold xl:text-3xl">
                      {user.username}
                    </h2>

                    <div className="flex space-x-3 font-bold xl:text-lg">
                      <span>{followingCount} Following</span>
                      <span>{followerCount} Followers</span>
                    </div>
                  </div>

                  <div>
                    <p className="hyphens-auto text-center xl:text-lg">
                      {watch('bio') ? (
                        <span className="hyphens-manual">{watch('bio')}</span>
                      ) : (
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
        ) : (
          <div className="flex h-96 items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;

export const getServerSideProps: GetServerSideProps = withPageAuthRequired();
