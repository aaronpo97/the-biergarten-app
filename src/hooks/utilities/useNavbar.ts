import UserContext from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import { useState, useEffect, useContext } from 'react';

interface Page {
  slug: string;
  name: string;
}

/**
 * A custom hook that returns the current URL and the pages to display in the navbar. It
 * uses the user context to determine whether the user is authenticated or not.
 *
 * @returns An object with the following properties:
 *
 *   - `currentURL`: The current URL.
 *   - `pages`: The pages to display in the navbar.
 */
const useNavbar = () => {
  const router = useRouter();
  const [currentURL, setCurrentURL] = useState('/');

  const { user } = useContext(UserContext);

  const authenticatedPages: readonly Page[] = [
    { slug: '/account', name: 'Account' },
    { slug: '/api/users/logout', name: 'Logout' },
  ];

  const unauthenticatedPages: readonly Page[] = [
    { slug: '/login', name: 'Login' },
    { slug: '/register', name: 'Register' },
  ];

  /** These pages are accessible to both authenticated and unauthenticated users. */
  const otherPages: readonly Page[] = [
    { slug: '/beers', name: 'Beers' },
    { slug: '/breweries', name: 'Breweries' },
  ];

  /**
   * The pages to display in the navbar. If the user is authenticated, the authenticated
   * pages are displayed. Otherwise, the unauthenticated pages are displayed. The other
   * pages are always displayed.
   */
  const pages: readonly Page[] = [
    ...otherPages,
    ...(user ? authenticatedPages : unauthenticatedPages),
  ];

  /**
   * Sets the current URL to the current URL when the router's asPath changes. This
   * ensures that the current URL is always up to date. When the component unmounts, the
   * current URL is set to '/'.
   */
  useEffect(() => {
    setCurrentURL(router.asPath);

    return () => {
      setCurrentURL('/');
    };
  }, [router.asPath]);

  return { currentURL, pages };
};

export default useNavbar;
