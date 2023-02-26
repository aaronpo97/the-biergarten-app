import { GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { getLoginSession } from './session';

export type ExtendedGetServerSideProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
> = (
  context: GetServerSidePropsContext<Q, D>,
  session: Awaited<ReturnType<typeof getLoginSession>>,
) => Promise<GetServerSidePropsResult<P>>;

const withPageAuthRequired =
  <P extends { [key: string]: any } = { [key: string]: any }>(
    fn?: ExtendedGetServerSideProps<P>,
  ) =>
  async (context: GetServerSidePropsContext) => {
    try {
      const { req } = context;
      const session = await getLoginSession(req);

      if (!fn) {
        return { props: {} };
      }

      return await fn(context, session);
    } catch (error) {
      return { redirect: { destination: '/login', permanent: false } };
    }
  };

export default withPageAuthRequired;
