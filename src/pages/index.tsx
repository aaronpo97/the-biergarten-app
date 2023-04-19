import Layout from '@/components/ui/Layout';
import { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>The Biergarten App</title>
        <meta name="description" content="Home" />
      </Head>
      <Layout>
        <div className="flex h-full w-full items-center justify-center bg-primary">
          <div className="w-9/12 text-center lg:w-8/12">
            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl xl:text-8xl">
              The Biergarten App
            </h1>
            <p className="mt-4 text-lg lg:text-2xl">
              An app for beer lovers to share their favourite brews and breweries with
              like-minded people online.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
