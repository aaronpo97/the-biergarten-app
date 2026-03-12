import { createCookieSessionStorage, redirect } from "react-router";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

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

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 21, // 21 days (matches refresh token)
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "dev-secret-change-me"],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function commitSession(
  session: Awaited<ReturnType<typeof getSession>>,
) {
  return sessionStorage.commitSession(session);
}

export async function destroySession(
  session: Awaited<ReturnType<typeof getSession>>,
) {
  return sessionStorage.destroySession(session);
}

export async function requireAuth(request: Request): Promise<AuthTokens> {
  const session = await getSession(request);
  const accessToken = session.get("accessToken");
  const refreshToken = session.get("refreshToken");

  if (!accessToken || !refreshToken) {
    throw redirect("/login");
  }

  return {
    accessToken,
    refreshToken,
    userAccountId: session.get("userAccountId"),
    username: session.get("username"),
  };
}

export async function getOptionalAuth(
  request: Request,
): Promise<AuthTokens | null> {
  const session = await getSession(request);
  const accessToken = session.get("accessToken");

  if (!accessToken) return null;

  return {
    accessToken,
    refreshToken: session.get("refreshToken"),
    userAccountId: session.get("userAccountId"),
    username: session.get("username"),
  };
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Login failed (${res.status})`);
  }

  const data: ApiResponse<LoginPayload> = await res.json();
  return data.payload;
}

export async function register(body: {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Registration failed (${res.status})`);
  }

  const data: ApiResponse<RegistrationPayload> = await res.json();
  return data.payload;
}

export async function refreshTokens(refreshToken: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  const data: ApiResponse<LoginPayload> = await res.json();
  return data.payload;
}

export async function confirmEmail(token: string, accessToken: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/auth/confirm?token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Confirmation failed (${res.status})`);
  }

  const data: ApiResponse<{ userAccountId: string; confirmedDate: string }> =
    await res.json();
  return data.payload;
}

export async function createAuthSession(
  payload: LoginPayload,
  redirectTo: string,
) {
  const session = await sessionStorage.getSession();
  session.set("accessToken", payload.accessToken);
  session.set("refreshToken", payload.refreshToken);
  session.set("userAccountId", payload.userAccountId);
  session.set("username", payload.username);

  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}
