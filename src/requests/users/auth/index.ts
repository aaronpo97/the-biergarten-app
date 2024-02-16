import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { BasicUserInfoSchema } from '@/config/auth/types';
import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';
import type {
  SendEditUserRequest,
  SendForgotPasswordRequest,
  SendLoginUserRequest,
  SendRegisterUserRequest,
  SendUpdatePasswordRequest,
  SendUserFollowRequest,
  ValidateEmailRequest,
} from './types';
import { z } from 'zod';

export const sendEditUserRequest: SendEditUserRequest = async ({ user, data }) => {
  const response = await fetch(`/api/users/${user!.id}`, {
    body: JSON.stringify(data),
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('API response validation failed.');
  }

  return parsed.data;
};

export const sendForgotPasswordRequest: SendForgotPasswordRequest = async ({ email }) => {
  const response = await fetch('/api/users/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Something went wrong and we couldn't send the reset link.");
  }

  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
};

export const sendLoginUserRequest: SendLoginUserRequest = async ({
  username,
  password,
}) => {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const json: unknown = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('API response validation failed');
  }

  if (!parsed.data.success) {
    throw new Error(parsed.data.message);
  }
  const parsedPayload = BasicUserInfoSchema.safeParse(parsed.data.payload);
  if (!parsedPayload.success) {
    throw new Error('API response payload validation failed');
  }

  return parsedPayload.data;
};

export const sendRegisterUserRequest: SendRegisterUserRequest = async (data) => {
  const response = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('API response validation failed.');
  }

  if (!parsed.data.success) {
    throw new Error(parsed.data.message);
  }

  const parsedPayload = GetUserSchema.safeParse(parsed.data.payload);

  if (!parsedPayload.success) {
    throw new Error('API response payload validation failed.');
  }

  return parsedPayload.data;
};

export const sendUpdatePasswordRequest: SendUpdatePasswordRequest = async (data) => {
  const response = await fetch('/api/users/edit-password', {
    body: JSON.stringify(data),
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('API response validation failed.');
  }

  return parsed.data;
};

export const sendUserFollowRequest: SendUserFollowRequest = async ({ userId }) => {
  const response = await fetch(`/api/users/${userId}/follow-user`, { method: 'POST' });
  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid API response.');
  }

  return parsed.data;
};

export const validateEmailRequest: ValidateEmailRequest = async ({ email }) => {
  const response = await fetch(`/api/users/check-email?email=${email}`);
  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    return false;
  }

  const parsedPayload = z
    .object({ emailIsTaken: z.boolean() })
    .safeParse(parsed.data.payload);

  if (!parsedPayload.success) {
    return false;
  }

  return !parsedPayload.data.emailIsTaken;
};
