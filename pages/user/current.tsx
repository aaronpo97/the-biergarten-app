import Layout from '@/components/ui/Layout';
import Spinner from '@/components/ui/Spinner';
import withPageAuthRequired from '@/getServerSideProps/withPageAuthRequired';
import UserContext from '@/contexts/userContext';

import { GetServerSideProps, NextPage } from 'next';
import { useContext } from 'react';

const ProtectedPage: NextPage = () => {
  const { user, isLoading } = useContext(UserContext);

  const currentTime = new Date().getHours();

  const isMorning = currentTime > 4 && currentTime < 12;
  const isAfternoon = currentTime > 12 && currentTime < 18;
  const isEvening = (currentTime > 18 && currentTime < 24) || currentTime < 4;

  return (
    <Layout>
      <div className="flex h-full flex-col items-center justify-center space-y-3">
        {isLoading && <Spinner size="xl" />}
        {user && (
          <>
            <h1 className="text-7xl font-bold">
              Good {isMorning && 'morning'}
              {isAfternoon && 'afternoon'}
              {isEvening && 'evening'}
              {`, ${user?.firstName}!`}
            </h1>
            <h2 className="text-4xl font-bold">Welcome to the Biergarten App!</h2>
          </>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired();

export default ProtectedPage;
