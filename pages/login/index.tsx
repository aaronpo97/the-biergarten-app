import { NextPage } from 'next';
import Layout from '@/components/ui/Layout';
import LoginForm from '@/components/Login/LoginForm';
import Image from 'next/image';

import { FaUserCircle } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import redirectIfLoggedIn from '@/getServerSideProps/redirectIfLoggedIn';

const LoginPage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login to your account" />
      </Head>

      <div className="flex h-full flex-row">
        <div className="hidden h-full flex-col items-center justify-center bg-base-100 lg:flex lg:w-[60%]">
          <Image
            src="https://picsum.photos/1040/1080"
            alt="Login Image"
            width={4920}
            height={4080}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex h-full w-full flex-col items-center justify-center bg-base-300 lg:w-[40%]">
          <div className="w-10/12 space-y-5 sm:w-9/12">
            <div className=" flex flex-col items-center space-y-2">
              <FaUserCircle className="text-3xl" />
              <h1 className="text-4xl font-bold">Login</h1>
            </div>
            <LoginForm />
            <div className="mt-3 flex flex-col items-center space-y-1">
              <Link href="/register" className="text-primary-500 link-hover link italic">
                Don&apos;t have an account?
              </Link>
              <Link
                href="/reset-password"
                className="text-primary-500 link-hover link italic"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;

export const getServerSideProps = redirectIfLoggedIn({
  destination: '/',
  permanent: false,
});
