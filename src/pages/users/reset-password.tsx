import { setLoginSession } from '@/config/auth/session';
import { verifyResetPasswordToken } from '@/config/jwt';
import ServerError from '@/config/util/ServerError';
import { findUserByIdService } from '@/services/users/auth';

import { GetServerSideProps, NextApiResponse, NextPage } from 'next';

const TokenExpiredPage: NextPage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Token Expired</h1>
        <p className="text-lg">
          Your link to reset your password has expired or is invalid.
        </p>
      </div>
    </div>
  );
};

export default TokenExpiredPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const token = context.query.token as string | undefined;
    if (!token) {
      throw new ServerError('Token not provided', 400);
    }

    const { id } = await verifyResetPasswordToken(token as string);

    const user = await findUserByIdService({ userId: id as string });
    if (!user) {
      throw new ServerError('User not found', 404);
    }

    await setLoginSession(context.res as NextApiResponse, user);

    return { redirect: { destination: '/users/account', permanent: false } };
  } catch (error) {
    return { props: {} };
  }
};
