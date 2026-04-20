import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';

import ServerError from '@/config/util/ServerError';
import { findUserByIdService } from '@/services/users/auth';
import { getLoginSession } from '@/config/auth/session';
import { UserExtendedNextApiRequest } from '@/config/auth/types';

/** Get the current user from the session. Adds the user to the request object. */
const getCurrentUser = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const session = await getLoginSession(req);
  const user = await findUserByIdService({ userId: session?.id });

  if (!user) {
    throw new ServerError('User is not logged in.', 401);
  }

  req.user = user;
  return next();
};

export default getCurrentUser;
