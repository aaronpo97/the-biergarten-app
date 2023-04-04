import UserContext from '@/contexts/userContext';
import { useRouter } from 'next/router';
import { useContext } from 'react';

/**
 * Custom React hook that redirects the user to the home page if they are logged in. This
 * hook is used to prevent logged in users from accessing the login and signup pages. Must
 * be used under the UserContext provider.
 *
 * @returns {void}
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
