import { NextPage } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/ui/Layout';
import useUser from '@/hooks/useUser';
import LoginForm from '@/components/Login/LoginForm';

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
      <div className="flex h-full flex-row">
        <div className="flex h-full w-[40%] flex-col items-center justify-center bg-base-100">
          <h1>Login</h1>
        </div>
        <div className="flex h-full w-[60%] flex-col items-center justify-center bg-base-300">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
