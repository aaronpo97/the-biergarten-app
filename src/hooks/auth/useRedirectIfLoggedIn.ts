import UserContext from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import { useContext } from 'react';

/**
 * A custom hook to redirect the user to the home page if they are logged in.
 *
 * This hook is used to prevent logged in users from accessing the login and signup pages
 * and should only be used in a component that is under the UserContext provider.
 */
const useRedirectWhenLoggedIn = (): void => {
  const { user } = useContext(UserContext);
  const router = useRouter();

  if (!user) {
    return;
  }
  router.push('/');
};

export default useRedirectWhenLoggedIn;
