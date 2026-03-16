import { AuthProvider } from '@/contexts/UserContext';

import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { themeChange } from 'theme-change';
import { Analytics } from '@vercel/analytics/react';

import { Nunito_Sans } from 'next/font/google';
import Head from 'next/head';
import Layout from '@/components/ui/Layout';
import CustomToast from '@/components/ui/CustomToast';

const font = Nunito_Sans({ subsets: ['latin-ext'] });

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <>
      <style jsx global>
        {`
          html {
            font-family: ${font.style.fontFamily};
          }
        `}
      </style>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
      </Head>
      <AuthProvider>
        <Layout>
          <CustomToast>
            <Component {...pageProps} />
          </CustomToast>
        </Layout>
      </AuthProvider>

      <Analytics />
    </>
  );
};

export default App;
