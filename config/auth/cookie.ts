import { NextApiResponse } from 'next';
import { serialize, parse } from 'cookie';
import { SessionRequest } from './types';
import { NODE_ENV, SESSION_MAX_AGE, SESSION_TOKEN_NAME } from '../env';

export function setTokenCookie(res: NextApiResponse, token: string) {
  const cookie = serialize(SESSION_TOKEN_NAME, token, {
    maxAge: SESSION_MAX_AGE,
    httpOnly: false,
    secure: NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function removeTokenCookie(res: NextApiResponse) {
  const cookie = serialize(SESSION_TOKEN_NAME, '', { maxAge: -1, path: '/' });
  res.setHeader('Set-Cookie', cookie);
}

export function parseCookies(req: SessionRequest) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || '');
}

export function getTokenCookie(req: SessionRequest) {
  const cookies = parseCookies(req);
  return cookies[SESSION_TOKEN_NAME];
}
