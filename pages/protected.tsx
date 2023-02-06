import withPageAuthRequired from '@/config/auth/withPageAuthRequired';
import { GetServerSideProps, NextPage } from 'next';

const protectedPage: NextPage<{
  username: string;
}> = ({ username }) => {
  return (
    <div>
      <h1> Hello, {username}! </h1>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired();

export default protectedPage;
