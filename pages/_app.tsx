import UserContext from '@/contexts/userContext';
import useUser from '@/hooks/useUser';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  const { user, isLoading, error } = useUser();

  return (
    <UserContext.Provider value={{ user, isLoading, error }}>
      <Component {...pageProps} />
    </UserContext.Provider>
  );
}
