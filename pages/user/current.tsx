import Layout from '@/components/ui/Layout';
import Spinner from '@/components/ui/Spinner';
import withPageAuthRequired from '@/config/auth/withPageAuthRequired';
import useUser from '@/hooks/useUser';
import { GetServerSideProps, NextPage } from 'next';

const ProtectedPage: NextPage = () => {
  const { user, isLoading, error } = useUser();

  return (
    <Layout>
      <div className="flex h-full flex-col items-center justify-center">
        <h1 className="text-7xl font-bold text-white">Hello!</h1>
        <>
          {isLoading && <Spinner />}
          {error && <p>Something went wrong.</p>}
          {user && (
            <div>
              <p>{user.username}</p>
            </div>
          )}
        </>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired();

export default ProtectedPage;
