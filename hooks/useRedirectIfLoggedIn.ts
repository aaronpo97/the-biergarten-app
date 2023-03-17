import UserContext from '@/contexts/userContext';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

const useRedirectWhenLoggedIn = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }
    router.push('/');
  }, [user, router]);
};

export default useRedirectWhenLoggedIn;
