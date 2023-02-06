import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { getLoginSession } from '../session';
import { ExtendedNextApiRequest } from '../types';

/** Get the current user from the session. Adds the user to the request object. */
const getCurrentUser = async (
  req: ExtendedNextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const session = await getLoginSession(req);
  const user = { id: session.id, username: session.username };
  req.user = user;
  next();
};

export default getCurrentUser;
