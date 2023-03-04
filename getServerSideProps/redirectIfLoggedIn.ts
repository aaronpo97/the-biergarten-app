import { GetServerSideProps, GetServerSidePropsContext, Redirect } from 'next';
import { getLoginSession } from '@/config/auth/session';
import findUserById from '@/services/User/findUserById';

const redirectIfLoggedIn = (redirect: Redirect) => {
  const fn: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    try {
      const { req } = context;
      const session = await getLoginSession(req);

      const { id } = session;

      const user = await findUserById(id);

      if (!user) {
        throw new Error('Could not get user.');
      }

      return { redirect };
    } catch {
      return { props: {} };
    }
  };

  return fn;
};

export default redirectIfLoggedIn;
