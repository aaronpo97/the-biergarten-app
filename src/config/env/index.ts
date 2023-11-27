/* eslint-disable prefer-destructuring */
import { z } from 'zod';
import { env } from 'process';
import ServerError from '../util/ServerError';

import 'dotenv/config';

/**
 * Environment variables are validated at runtime to ensure that they are present and have
 * the correct type. This is done using the zod library.
 */
const envSchema = z.object({
  BASE_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_KEY: z.string(),
  CLOUDINARY_SECRET: z.string(),
  RESET_PASSWORD_TOKEN_SECRET: z.string(),
  CONFIRMATION_TOKEN_SECRET: z.string(),
  SESSION_SECRET: z.string(),
  SESSION_TOKEN_NAME: z.string(),
  SESSION_MAX_AGE: z.coerce.number().positive(),

  POSTGRES_PRISMA_URL: z.string().url(),
  POSTGRES_URL_NON_POOLING: z.string().url(),
  SHADOW_DATABASE_URL: z.string().url(),

  NODE_ENV: z.enum(['development', 'production', 'test']),
  SPARKPOST_API_KEY: z.string(),
  SPARKPOST_SENDER_ADDRESS: z.string().email(),
  MAPBOX_ACCESS_TOKEN: z.string(),

  ADMIN_PASSWORD: z.string().regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/),
});

const parsed = envSchema.safeParse(env);

if (!parsed.success) {
  throw new ServerError('Invalid environment variables', 500);
}

/**
 * Base URL of the application.
 *
 * @example
 *   'https://example.com';
 */
export const BASE_URL = parsed.data.BASE_URL;

/**
 * Cloudinary cloud name.
 *
 * @example
 *   'my-cloud';
 *
 * @see https://cloudinary.com/documentation/cloudinary_references
 * @see https://cloudinary.com/console
 */

export const CLOUDINARY_CLOUD_NAME = parsed.data.CLOUDINARY_CLOUD_NAME;

/**
 * Cloudinary API key.
 *
 * @example
 *   '123456789012345';
 *
 * @see https://cloudinary.com/documentation/cloudinary_references
 * @see https://cloudinary.com/console
 */
export const CLOUDINARY_KEY = parsed.data.CLOUDINARY_KEY;

/**
 * Cloudinary API secret.
 *
 * @example
 *   'abcdefghijklmnopqrstuvwxyz123456';
 *
 * @see https://cloudinary.com/documentation/cloudinary_references
 * @see https://cloudinary.com/console
 */
export const CLOUDINARY_SECRET = parsed.data.CLOUDINARY_SECRET;

/**
 * Secret key for signing confirmation tokens.
 *
 * @example
 *   'abcdefghijklmnopqrstuvwxyz123456';
 *
 * @see README.md for instructions on generating a secret key.
 */
export const CONFIRMATION_TOKEN_SECRET = parsed.data.CONFIRMATION_TOKEN_SECRET;

/**
 * Secret key for signing reset password tokens.
 *
 * @example
 *   'abcdefghijklmnopqrstuvwxyz123456';
 *
 * @see README.md for instructions on generating a secret key.
 */

export const RESET_PASSWORD_TOKEN_SECRET = parsed.data.RESET_PASSWORD_TOKEN_SECRET;

/**
 * Secret key for signing session cookies.
 *
 * @example
 *   'abcdefghijklmnopqrstuvwxyz123456';
 *
 * @see README.md for instructions on generating a secret key.
 */
export const SESSION_SECRET = parsed.data.SESSION_SECRET;

/**
 * Name of the session cookie.
 *
 * @example
 *   'my-app-session';
 */
export const SESSION_TOKEN_NAME = parsed.data.SESSION_TOKEN_NAME;

/**
 * Maximum age of the session cookie in milliseconds.
 *
 * @example
 *   '86400000'; // 24 hours
 */
export const SESSION_MAX_AGE = parsed.data.SESSION_MAX_AGE;

/**
 * PostgreSQL connection URL for Prisma taken from Neon.
 *
 * @example
 *   'postgresql://user:password@host:5432/database';
 *
 * @see https://neon.tech/docs/guides/prisma
 */
export const POSTGRES_PRISMA_URL = parsed.data.POSTGRES_PRISMA_URL;

/**
 * Non-pooling PostgreSQL connection URL taken from Neon.
 *
 * @example
 *   'postgresql://user:password@host:5432/database';
 *
 * @see https://neon.tech/docs/guides/prisma
 */
export const POSTGRES_URL_NON_POOLING = parsed.data.POSTGRES_URL_NON_POOLING;

/**
 * The URL of another Neon PostgreSQL database to shadow for migrations.
 *
 * @example
 *   'postgresql://user:password@host:5432/database';
 *
 * @see https://neon.tech/docs/guides/prisma-migrate
 */
export const SHADOW_DATABASE_URL = parsed.data.SHADOW_DATABASE_URL;

/**
 * Node environment.
 *
 * @example
 *   'production';
 *
 * @see https://nodejs.org/api/process.html#process_process_env
 */
export const NODE_ENV = parsed.data.NODE_ENV;

/**
 * SparkPost API key.
 *
 * @example
 *   'abcdefghijklmnopqrstuvwxyz123456';
 *
 * @see https://app.sparkpost.com/account/api-keys
 */
export const SPARKPOST_API_KEY = parsed.data.SPARKPOST_API_KEY;

/**
 * Sender email address for SparkPost.
 *
 * @example
 *   'noreply@example.com';
 *
 * @see https://app.sparkpost.com/domains/list/sending
 */
export const SPARKPOST_SENDER_ADDRESS = parsed.data.SPARKPOST_SENDER_ADDRESS;

/**
 * Your Mapbox access token.
 *
 * @example
 *   'pk.abcdefghijklmnopqrstuvwxyz123456';
 *
 * @see https://docs.mapbox.com/help/how-mapbox-works/access-tokens/
 */
export const MAPBOX_ACCESS_TOKEN = parsed.data.MAPBOX_ACCESS_TOKEN;

/**
 * Admin password for seeding the database.
 *
 * @example
 *   'abcdefghijklmnopqrstuvwxyz123456';
 *
 * @see README.md for instructions on generating a secret key.
 */

export const ADMIN_PASSWORD = parsed.data.ADMIN_PASSWORD;
