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

      <div className="flex h-full flex-row">
        <div className="hidden h-full flex-col items-center justify-center bg-base-100 lg:flex lg:w-[55%]">
          <CldImage
            src="https://res.cloudinary.com/dxie9b7na/image/upload/v1701056793/cloudinary-images/pexels-elevate-1267700_jrno3s.jpg"
            alt="Login Image"
            width={5000}
            height={5000}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex h-full w-full flex-col items-center justify-center bg-base-300 lg:w-[45%]">
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
                href="/users/forgot-password"
                className="text-primary-500 link-hover link italic"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
