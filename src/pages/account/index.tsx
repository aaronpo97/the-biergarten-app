import withPageAuthRequired from '@/util/withPageAuthRequired';
import { NextPage } from 'next';

import { Tab } from '@headlessui/react';
import Head from 'next/head';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import { z } from 'zod';
import DBClient from '@/prisma/DBClient';
import AccountInfo from '@/components/Account/AccountInfo';

interface AccountPageProps {
  user: z.infer<typeof GetUserSchema>;
}

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
        <div className="m-12 flex w-11/12 flex-col items-center justify-center space-y-3 lg:w-7/12">
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
                <Tab className="tab tab-md w-1/3 uppercase ui-selected:tab-active">
                  Account Info
                </Tab>
                <Tab className="tab tab-md w-1/3 uppercase ui-selected:tab-active">
                  Security
                </Tab>
                <Tab className="tab tab-md w-1/3 uppercase ui-selected:tab-active">
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
