import withPageAuthRequired from '@/util/withPageAuthRequired';
import { NextPage } from 'next';

import { FC, useState } from 'react';
import { Switch, Tab } from '@headlessui/react';
import Head from 'next/head';
import FormInfo from '@/components/ui/forms/FormInfo';
import FormLabel from '@/components/ui/forms/FormLabel';
import FormError from '@/components/ui/forms/FormError';
import FormTextInput from '@/components/ui/forms/FormTextInput';
import { zodResolver } from '@hookform/resolvers/zod';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DBClient from '@/prisma/DBClient';

interface AccountPageProps {
  user: z.infer<typeof GetUserSchema>;
}

const AccountInfo: FC<{
  user: z.infer<typeof GetUserSchema>;
}> = ({ user }) => {
  const { register, handleSubmit, formState, reset } = useForm<
    z.infer<typeof GetUserSchema>
  >({
    resolver: zodResolver(GetUserSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
    },
  });

  const [inEditMode, setInEditMode] = useState(false);

  return (
    <div className="mt-8">
      <div className="flex flex-col space-y-3">
        <div className="flex flex-row">
          <label className="label-text" htmlFor="edit-toggle">
            Edit Account Info
          </label>
          <Switch
            checked={inEditMode}
            className="toggle"
            onClick={() => {
              setInEditMode((editMode) => !editMode);
              reset();
            }}
            id="edit-toggle"
          />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(() => {})}>
          <div>
            <FormInfo>
              <FormLabel htmlFor="username">Username</FormLabel>
              <FormError>{formState.errors.username?.message}</FormError>
            </FormInfo>
            <FormTextInput
              type="text"
              disabled={!inEditMode || formState.isSubmitting}
              error={!!formState.errors.username}
              id="username"
              formValidationSchema={register('username')}
            />
            <FormInfo>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormError>{''}</FormError>
            </FormInfo>
            <FormTextInput
              type="email"
              disabled={!inEditMode || formState.isSubmitting}
              error={!!formState.errors.email}
              id="email"
              formValidationSchema={register('email')}
            />

            <div className="flex space-x-3">
              <div className="w-1/2">
                <FormInfo>
                  <FormLabel htmlFor="firstName">First Name</FormLabel>
                  <FormError>{formState.errors.firstName?.message}</FormError>
                </FormInfo>
                <FormTextInput
                  type="text"
                  disabled={!inEditMode || formState.isSubmitting}
                  error={!!formState.errors.firstName}
                  id="firstName"
                  formValidationSchema={register('firstName')}
                />
              </div>
              <div className="w-1/2">
                <FormInfo>
                  <FormLabel htmlFor="lastName">Last Name</FormLabel>
                  <FormError>{formState.errors.lastName?.message}</FormError>
                </FormInfo>
                <FormTextInput
                  type="text"
                  disabled={!inEditMode || formState.isSubmitting}
                  error={!!formState.errors.lastName}
                  id="lastName"
                  formValidationSchema={register('lastName')}
                />
              </div>
            </div>
          </div>
          {inEditMode && <button className="btn-primary btn w-full">Save Changes</button>}
        </form>
      </div>
    </div>
  );
};

const AccountPage: NextPage<AccountPageProps> = ({ user }) => {
  return (
    <>
      <Head>
        <title>Your Account | The Biergarten App</title>
        <meta
          name="description"
          content="Your account page. Here you can view your account information, change your settings, and view your posts."
        />
      </Head>
      <div className="flex h-full flex-col items-center bg-base-300">
        <div className="m-12 flex w-9/12 flex-col items-center justify-center space-y-3">
          <div className="flex flex-col items-center space-y-3">
            <div className="avatar">
              <div className="bg-base-black w-24 rounded-full bg-slate-700" />
            </div>

            <div className="flex flex-col items-center space-y-1">
              <p className="text-3xl font-bold">Hello, {user.username}!</p>
              <p className="text-lg">Welcome to your account page.</p>
            </div>
          </div>

          <div className="w-full">
            <Tab.Group>
              <Tab.List className="tabs tabs-boxed items-center justify-center rounded-2xl">
                <Tab className="tab tab-md w-1/2 uppercase ui-selected:tab-active">
                  Account Info
                </Tab>
                <Tab className="tab tab-md w-1/2 uppercase ui-selected:tab-active">
                  Your Posts
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  <AccountInfo user={user} />
                </Tab.Panel>
                <Tab.Panel>Content 3</Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountPage;

export const getServerSideProps = withPageAuthRequired(async (context, session) => {
  const { id } = session;

  const user: z.infer<typeof GetUserSchema> | null =
    await DBClient.instance.user.findUnique({
      where: { id },
      select: {
        username: true,
        email: true,
        accountIsVerified: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        id: true,
        createdAt: true,
      },
    });

  if (!user) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
  };
});
