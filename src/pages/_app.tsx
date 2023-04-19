import UserContext from '@/contexts/userContext';
import useUser from '@/hooks/useUser';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
});

export default function App({ Component, pageProps }: AppProps) {
  const { user, isLoading, error, mutate } = useUser();

  return (
    <>
      <style jsx global>
        {`
          html {
            font-family: ${spaceGrotesk.style.fontFamily};
          }
        `}
      </style>

      <UserContext.Provider value={{ user, isLoading, error, mutate }}>
        <Component {...pageProps} />
      </UserContext.Provider>
    </>
  );
}
