import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import findUserById from '@/services/User/findUserById';
import ServerError from '@/config/util/ServerError';
import { getLoginSession } from '../../auth/session';
import { UserExtendedNextApiRequest } from '../../auth/types';

/** Get the current user from the session. Adds the user to the request object. */
const getCurrentUser = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const session = await getLoginSession(req);
  const user = await findUserById(session?.id);

  if (!user) {
    throw new ServerError('User is not logged in.', 401);
  }

  req.user = user;
  return next();
};

export default getCurrentUser;
