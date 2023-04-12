import { NextApiResponse } from 'next';
import Iron from '@hapi/iron';
import {
  SessionRequest,
  BasicUserInfoSchema,
  UserSessionSchema,
} from '@/config/auth/types';
import { z } from 'zod';
import { SESSION_MAX_AGE, SESSION_SECRET } from '@/config/env';
import { setTokenCookie, getTokenCookie } from './cookie';
import ServerError from '../util/ServerError';

export async function setLoginSession(
  res: NextApiResponse,
  session: z.infer<typeof BasicUserInfoSchema>,
) {
  if (!SESSION_SECRET) {
    throw new ServerError('Authentication is not configured.', 500);
  }
  const createdAt = Date.now();
  const obj = { ...session, createdAt, maxAge: SESSION_MAX_AGE };
  const token = await Iron.seal(obj, SESSION_SECRET, Iron.defaults);

  setTokenCookie(res, token);
}

export async function getLoginSession(req: SessionRequest) {
  if (!SESSION_SECRET) {
    throw new ServerError('Authentication is not configured.', 500);
  }

  const token = getTokenCookie(req);
  if (!token) {
    throw new ServerError('You are not logged in.', 401);
  }

  const session = await Iron.unseal(token, SESSION_SECRET, Iron.defaults);

  const parsed = UserSessionSchema.safeParse(session);

  if (!parsed.success) {
    throw new ServerError('Session is invalid.', 401);
  }

  const { createdAt, maxAge } = parsed.data;

  const expiresAt = createdAt + maxAge * 1000;
  if (Date.now() > expiresAt) {
    throw new ServerError('Session expired', 401);
  }

  return parsed.data;
}
