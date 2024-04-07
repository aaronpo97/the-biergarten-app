import { NextPage } from 'next';

import LoginForm from '@/components/Login/LoginForm';

import { FaUserCircle } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';

import useRedirectWhenLoggedIn from '@/hooks/auth/useRedirectIfLoggedIn';
import { CldImage } from 'next-cloudinary';

const LoginPage: NextPage = () => {
  useRedirectWhenLoggedIn();
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login to your account" />
      </Head>

      <div className="relative flex h-dvh w-full flex-col items-center justify-center bg-base-300">
        <CldImage
          src="https://res.cloudinary.com/dxie9b7na/image/upload/v1701056793/cloudinary-images/pexels-elevate-1267700_jrno3s.jpg"
          alt="Login Image"
          width={5000}
          height={5000}
          className="pointer-events-none absolute h-full w-full object-cover mix-blend-overlay"
        />

        <div className="relative flex w-9/12 flex-col items-center text-center text-base-content lg:w-6/12">
          <div className="mb-8 flex w-full flex-col items-center space-y-2 text-center">
            <FaUserCircle className="text-6xl text-primary-content" />
            <h1 className="text-6xl font-extrabold">Login</h1>
          </div>
          <div className="w-full">
            <LoginForm />
          </div>

          <div className="mt-5 flex w-full flex-col space-y-1 text-center font-bold italic">
            <Link className="link-hover link text-lg" href="/register">
              Don&apos;t have an account?
            </Link>

            <Link className="link-hover link text-lg" href="/users/forgot-password">
              Forgot your password?{' '}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
