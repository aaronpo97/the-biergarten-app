import UserContext from '@/contexts/userContext';
import useUser from '@/hooks/useUser';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { themeChange } from 'theme-change';

import { Space_Grotesk } from 'next/font/google';
import Head from 'next/head';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    themeChange(false);
  }, []);
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
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
      </Head>
      <UserContext.Provider value={{ user, isLoading, error, mutate }}>
        <Component {...pageProps} />
      </UserContext.Provider>
    </>
  );
}
