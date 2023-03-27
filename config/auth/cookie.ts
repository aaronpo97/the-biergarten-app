import { NextApiResponse } from 'next';
import { serialize, parse } from 'cookie';
import { SessionRequest } from './types';

const TOKEN_NAME = 'token';
export const MAX_AGE = 60 * 60 * 8; // 8 hours

export function setTokenCookie(res: NextApiResponse, token: string) {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function removeTokenCookie(res: NextApiResponse) {
  const cookie = serialize(TOKEN_NAME, '', { maxAge: -1, path: '/' });
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
  return cookies[TOKEN_NAME];
}
