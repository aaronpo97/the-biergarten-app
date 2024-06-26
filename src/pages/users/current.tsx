import Spinner from '@/components/ui/Spinner';
import withPageAuthRequired from '@/util/withPageAuthRequired';
import UserContext from '@/contexts/UserContext';

import { GetServerSideProps, NextPage } from 'next';
import { useContext } from 'react';
import useMediaQuery from '@/hooks/utilities/useMediaQuery';
import Head from 'next/head';

const ProtectedPage: NextPage = () => {
  const { user, isLoading } = useContext(UserContext);

  const currentTime = new Date().getHours();

  const isMorning = currentTime >= 3 && currentTime < 12;
  const isAfternoon = currentTime >= 12 && currentTime < 18;
  const isEvening = currentTime >= 18 || currentTime < 3;

  const isDesktop = useMediaQuery('(min-width: 768px)');
  return (
    <>
      <Head>
        <title>Hello! | The Biergarten App</title>
      </Head>
      <div className="h-dvh flex flex-col items-center justify-center space-y-3 bg-base-100 text-center">
        {isLoading && <Spinner size={isDesktop ? 'xl' : 'md'} />}
        {user && !isLoading && (
          <>
            <h1 className="text-2xl font-bold lg:text-7xl">
              Good {isMorning && 'morning'}
              {isAfternoon && 'afternoon'}
              {isEvening && 'evening'}
              {`, ${user?.firstName}!`}
            </h1>
            <h2 className="text-xl font-bold lg:text-4xl">
              Welcome to the Biergarten App!
            </h2>
          </>
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired();

export default ProtectedPage;
