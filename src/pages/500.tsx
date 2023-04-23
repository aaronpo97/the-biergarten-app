import { NextPage } from 'next';
import Head from 'next/head';

const ServerErrorPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>500 Internal Server Error</title>
        <meta name="description" content="500 Internal Server Error" />
      </Head>
      <div className="mx-2 flex h-full flex-col items-center justify-center text-center lg:mx-0">
        <h1 className="text-2xl font-bold lg:text-4xl">500: Something Went Wrong</h1>
        <h2 className="text-lg font-bold">
          Please try again later or contact us if the problem persists.
        </h2>
      </div>
    </>
  );
};

export default ServerErrorPage;
