import RegisterUserForm from '@/components/RegisterUserForm';

import useRedirectWhenLoggedIn from '@/hooks/auth/useRedirectIfLoggedIn';
import { NextPage } from 'next';
import { CldImage } from 'next-cloudinary';
import Head from 'next/head';

import { FaUserCircle } from 'react-icons/fa';

const RegisterUserPage: NextPage = () => {
  useRedirectWhenLoggedIn();

  return (
    <>
      <Head>
        <title>Register User</title>
        <meta name="description" content="Register a new user" />
      </Head>

      <div className="relative flex min-h-dvh w-full flex-col items-center justify-center bg-base-300">
        <CldImage
          src="https://res.cloudinary.com/dxie9b7na/image/upload/v1701056793/cloudinary-images/pexels-elevate-1267700_jrno3s.jpg"
          alt="Login Image"
          width={5000}
          height={5000}
          className="pointer-events-none absolute h-full w-full object-cover mix-blend-overlay"
        />

        <div className="relative flex w-10/12 flex-col items-center pb-20 text-center text-base-content lg:w-6/12">
          <div className="mb-8 mt-20 flex w-full flex-col items-center space-y-2 text-center">
            <FaUserCircle className="text-6xl text-primary-content" />
            <h1 className="text-6xl font-extrabold">Register</h1>
          </div>
          <div className="w-full">
            <RegisterUserForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterUserPage;
