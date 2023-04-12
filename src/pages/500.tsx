import Layout from '@/components/ui/Layout';
import { NextPage } from 'next';
import Head from 'next/head';

const ServerErrorPage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>500 Internal Server Error</title>
        <meta name="description" content="500 Internal Server Error" />
      </Head>
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <h1 className="text-7xl font-bold">Error: 500</h1>
        <h2 className="text-xl font-bold">Internal Server Error</h2>
      </div>
    </Layout>
  );
};

export default ServerErrorPage;
