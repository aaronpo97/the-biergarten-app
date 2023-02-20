import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getLoginSession } from './session';

const withPageAuthRequired =
  (fn?: GetServerSideProps) => async (context: GetServerSidePropsContext) => {
    try {
      const { req } = context;
      await getLoginSession(req);

      if (!fn) {
        return { props: {} };
      }
      return await fn(context);
    } catch (error) {
      console.log(error);
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
  };

export default withPageAuthRequired;
