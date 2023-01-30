// create a 404 next js page using tailwind

import Layout from '@/components/ui/Layout';
import { NextPage } from 'next';

const NotFound: NextPage = () => {
  return (
    <Layout>
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <h1 className="text-7xl font-bold">Error: 404</h1>
        <h2 className="text-xl font-bold">Page Not Found</h2>
      </div>
    </Layout>
  );
};

export default NotFound;
