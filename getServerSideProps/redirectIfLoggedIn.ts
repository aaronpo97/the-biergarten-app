import { GetServerSideProps, GetServerSidePropsContext, Redirect } from 'next';
import { getLoginSession } from '@/config/auth/session';

const redirectIfLoggedIn = (redirect: Redirect) => {
  const fn: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    try {
      const { req } = context;
      await getLoginSession(req);
      return { redirect };
    } catch {
      return { props: {} };
    }
  };

  return fn;
};

export default redirectIfLoggedIn;
