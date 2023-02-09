import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import findUserById from '@/services/User/findUserById';
import ServerError from '@/config/util/ServerError';
import { getLoginSession } from '../session';
import { UserExtendedNextApiRequest } from '../types';

/** Get the current user from the session. Adds the user to the request object. */
const getCurrentUser = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const session = await getLoginSession(req);
  const user = await findUserById(session?.id);

  if (!user) {
    throw new ServerError('Could not get user.', 401);
  }

  req.user = user;
  next();
};

export default getCurrentUser;
