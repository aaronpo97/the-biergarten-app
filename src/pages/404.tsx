// create a 404 next js page using tailwind

import Layout from '@/components/ui/Layout';
import { NextPage } from 'next';
import Head from 'next/head';

const NotFound: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>404 Page Not Found</title>
        <meta name="description" content="404 Page Not Found" />
      </Head>
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <h1 className="text-7xl font-bold">Error: 404</h1>
        <h2 className="text-xl font-bold">Page Not Found</h2>
      </div>
    </Layout>
  );
};

export default NotFound;
