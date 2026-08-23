import { createCookieSessionStorage, redirect } from 'react-router';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export interface AuthTokens {
   accessToken: string;
   refreshToken: string;
   userAccountId: string;
   username: string;
}

interface ApiResponse<T> {
   message: string;
   payload: T;
}

interface LoginPayload {
   userAccountId: string;
   username: string;
   refreshToken: string;
   accessToken: string;
}

interface RegistrationPayload extends LoginPayload {
   confirmationEmailSent: boolean;
}

interface UpdateUsernamePayload {
   userAccountId: string;
   username: string;
}

interface UpdateEmailPayload {
   userAccountId: string;
   email: string;
   emailConfirmed: boolean;
}

interface UpdateProfilePayload {
   userAccountId: string;
   firstName: string;
   lastName: string;
   dateOfBirth: string;
}

interface UpdatePasswordPayload {
   userAccountId: string;
   changedAt: string;
}

export interface UserAccountDetails {
   username: string;
   firstName: string;
   lastName: string;
   email: string;
   dateOfBirth: string;
}

const sessionStorage = createCookieSessionStorage({
   cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 21, // 21 days (matches refresh token)
      path: '/',
      sameSite: 'lax',
      secrets: [process.env.SESSION_SECRET || 'dev-secret-change-me'],
      secure: process.env.NODE_ENV === 'production',
   },
});

export const getSession = async (request: Request) => {
   return sessionStorage.getSession(request.headers.get('Cookie'));
};

export const commitSession = async (session: Awaited<ReturnType<typeof getSession>>) => {
   return sessionStorage.commitSession(session);
};

export const destroySession = async (session: Awaited<ReturnType<typeof getSession>>) => {
   return sessionStorage.destroySession(session);
};

export const requireAuth = async (request: Request): Promise<AuthTokens> => {
   const session = await getSession(request);
   const accessToken = session.get('accessToken');
   const refreshToken = session.get('refreshToken');

   if (!accessToken || !refreshToken) {
      throw redirect('/login');
   }

   return {
      accessToken,
      refreshToken,
      userAccountId: session.get('userAccountId'),
      username: session.get('username'),
   };
};

export const getOptionalAuth = async (request: Request): Promise<AuthTokens | null> => {
   const session = await getSession(request);
   const accessToken = session.get('accessToken');

   if (!accessToken) return null;

   return {
      accessToken,
      refreshToken: session.get('refreshToken'),
      userAccountId: session.get('userAccountId'),
      username: session.get('username'),
   };
};

export const login = async (username: string, password: string) => {
   const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
   });

   if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Login failed (${res.status})`);
   }

   const data: ApiResponse<LoginPayload> = await res.json();
   return data.payload;
};

export const register = async (body: {
   username: string;
   firstName: string;
   lastName: string;
   email: string;
   dateOfBirth: string;
   password: string;
}) => {
   const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
   });

   if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Registration failed (${res.status})`);
   }

   const data: ApiResponse<RegistrationPayload> = await res.json();
   return data.payload;
};

export const refreshTokens = async (refreshToken: string) => {
   const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'X-Refresh-Token': refreshToken },
   });

   if (!res.ok) {
      throw new Error('Token refresh failed');
   }

   const data: ApiResponse<LoginPayload> = await res.json();
   return data.payload;
};

export const getUserAccount = async (userAccountId: string): Promise<UserAccountDetails> => {
   const res = await fetch(`${API_BASE_URL}/api/user/${userAccountId}`);

   if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to load account details (${res.status})`);
   }

   return res.json();
};

export const confirmEmail = async (token: string, accessToken: string) => {
   const res = await fetch(`${API_BASE_URL}/api/auth/confirm?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
   });

   if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Confirmation failed (${res.status})`);
   }

   const data: ApiResponse<{ userAccountId: string; confirmedDate: string }> = await res.json();
   return data.payload;
};

const authorizedRequest = async <T>(
   path: string,
   accessToken: string,
   init: { method: string; body?: unknown }
): Promise<T> => {
   const res = await fetch(`${API_BASE_URL}${path}`, {
      method: init.method,
      headers: {
         Authorization: `Bearer ${accessToken}`,
         ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
   });

   if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed (${res.status})`);
   }

   const data: ApiResponse<T> = await res.json();
   return data.payload;
};

export const updateUsername = async (accessToken: string, newUsername: string) => {
   return authorizedRequest<UpdateUsernamePayload>('/api/auth/username', accessToken, {
      method: 'PATCH',
      body: { newUsername },
   });
};

export const updateEmail = async (accessToken: string, newEmail: string) => {
   return authorizedRequest<UpdateEmailPayload>('/api/auth/email', accessToken, {
      method: 'PATCH',
      body: { newEmail },
   });
};

export const updateProfile = async (
   accessToken: string,
   firstName: string,
   lastName: string,
   dateOfBirth: string
) => {
   return authorizedRequest<UpdateProfilePayload>('/api/auth/profile', accessToken, {
      method: 'PATCH',
      body: { firstName, lastName, dateOfBirth },
   });
};

export const updatePassword = async (
   accessToken: string,
   currentPassword: string,
   newPassword: string
) => {
   return authorizedRequest<UpdatePasswordPayload>('/api/auth/password', accessToken, {
      method: 'PATCH',
      body: { currentPassword, newPassword },
   });
};

export const deleteAccount = async (accessToken: string) => {
   await authorizedRequest<null>('/api/auth/account', accessToken, { method: 'DELETE' });
};

export const createAuthSession = async (payload: LoginPayload, redirectTo: string) => {
   const session = await sessionStorage.getSession();
   session.set('accessToken', payload.accessToken);
   session.set('refreshToken', payload.refreshToken);
   session.set('userAccountId', payload.userAccountId);
   session.set('username', payload.username);

   return redirect(redirectTo, {
      headers: { 'Set-Cookie': await commitSession(session) },
   });
};
