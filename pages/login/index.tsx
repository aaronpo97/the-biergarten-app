import { NextPage } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/ui/Layout';
import useUser from '@/hooks/useUser';
import LoginForm from '@/components/Login/LoginForm';
import Image from 'next/image';

import { FaUserCircle } from 'react-icons/fa';
import Head from 'next/head';

const LoginPage: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }

    router.push(`/user/current`);
  }, [user, router]);

  return (
    <Layout>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login to your account" />
      </Head>

      <div className="flex h-full flex-row">
        <div className="flex h-full w-[60%] flex-col items-center justify-center bg-base-100">
          <Image
            src="https://picsum.photos/1040/1080"
            alt="Login Image"
            width={4920}
            height={4080}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex h-full w-[40%] flex-col items-center space-y-5 bg-base-300">
          <div className="mt-44 w-9/12">
            <div className="flex flex-col items-center space-y-2">
              <FaUserCircle className="text-3xl" />
              <h1 className="text-4xl font-bold">Login</h1>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
