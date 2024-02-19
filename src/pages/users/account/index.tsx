import withPageAuthRequired from '@/util/withPageAuthRequired';
import { NextPage } from 'next';

import { Tab } from '@headlessui/react';
import Head from 'next/head';
import AccountInfo from '@/components/Account/AccountInfo';
import { useContext, useReducer } from 'react';
import UserContext from '@/contexts/UserContext';
import Security from '@/components/Account/Security';
import DeleteAccount from '@/components/Account/DeleteAccount';
import accountPageReducer from '@/reducers/accountPageReducer';
import UserAvatar from '@/components/Account/UserAvatar';
import UserPosts from '@/components/Account/UserPosts';
import UpdateProfileLink from '@/components/Account/UpdateProfileLink';

const AccountPage: NextPage = () => {
  const { user } = useContext(UserContext);

  const [pageState, dispatch] = useReducer(accountPageReducer, {
    accountInfoOpen: false,
    securityOpen: false,
    deleteAccountOpen: false,
  });

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Your Account | The Biergarten App</title>
        <meta
          name="description"
          content="Your account page. Here you can view your account information, change your settings, and view your posts."
        />
      </Head>
      <div className="mt-10 flex min-h-dvh flex-col items-center">
        <div className="m-12 flex w-11/12 flex-col items-center justify-center space-y-3 lg:w-8/12">
          <div className="flex flex-col items-center space-y-3">
            <div className="mb-1 h-28 w-28">
              <UserAvatar user={user} />
            </div>

            <div className="flex flex-col items-center space-y-1">
              <p className="text-3xl font-bold">Hello, {user!.username}!</p>
              <p className="text-lg">Welcome to your account page.</p>
            </div>
          </div>

          <div className="h-full w-full">
            <Tab.Group>
              <Tab.List className="tabs-boxed tabs grid grid-cols-2">
                <Tab className="tab uppercase ui-selected:tab-active">Account</Tab>
                <Tab className="tab uppercase ui-selected:tab-active">Your Posts</Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel className="mt-3 h-full space-y-3">
                  <UpdateProfileLink />
                  <AccountInfo pageState={pageState} dispatch={dispatch} />
                  <Security pageState={pageState} dispatch={dispatch} />
                  <DeleteAccount pageState={pageState} dispatch={dispatch} />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <UserPosts />
                </Tab.Panel>
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
