import UserContext from '@/contexts/userContext';
import { useRouter } from 'next/router';
import { useContext } from 'react';

const useRedirectWhenLoggedIn = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();

  if (!user) {
    return;
  }
  router.push('/');
};

export default useRedirectWhenLoggedIn;
