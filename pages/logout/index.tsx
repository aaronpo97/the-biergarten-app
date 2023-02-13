import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const LogoutPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.reload();
    router.push('/');
  }, [router]);
  return null;
};

export default LogoutPage;
