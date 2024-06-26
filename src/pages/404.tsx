import { NextPage } from 'next';
import Head from 'next/head';

const NotFound: NextPage = () => {
  return (
    <>
      <Head>
        <title>404 Page Not Found</title>
        <meta name="description" content="404 Page Not Found" />
      </Head>
      <div className="mx-2 flex h-dvh flex-col items-center justify-center text-center lg:mx-0">
        <h1 className="text-3xl font-bold lg:text-5xl">404: Not Found</h1>
        <h2 className="text-lg font-bold">
          Sorry, the page you are looking for does not exist.
        </h2>
      </div>
    </>
  );
};

export default NotFound;
