import UserContext from '@/contexts/userContext';
import withPageAuthRequired from '@/util/withPageAuthRequired';
import { NextPage } from 'next';

import { useContext } from 'react';
import { Tab } from '@headlessui/react';
import Head from 'next/head';

interface AccountPageProps {}

const AccountPage: NextPage<AccountPageProps> = () => {
  const { user } = useContext(UserContext);

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
              <p className="text-3xl font-bold">Hello, {user?.username}!</p>
              <p className="text-lg">Welcome to your account page.</p>
            </div>
          </div>

          <div className="w-full">
            <Tab.Group>
              <Tab.List className="tabs tabs-boxed items-center justify-center rounded-2xl">
                <Tab className="tab tab-md w-1/3 uppercase ui-selected:tab-active">
                  Settings
                </Tab>
                <Tab className="tab tab-md w-1/3 uppercase ui-selected:tab-active">
                  Account Info
                </Tab>
                <Tab className="tab tab-md w-1/3 uppercase ui-selected:tab-active">
                  Your Posts
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>Content 1</Tab.Panel>
                <Tab.Panel>Content 2</Tab.Panel>
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

export const getServerSideProps = withPageAuthRequired();
