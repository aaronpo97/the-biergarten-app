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
  CONFIRMATION_TOKEN_SECRET: z.string(),
  SESSION_SECRET: z.string(),
  SESSION_TOKEN_NAME: z.string(),
  SESSION_MAX_AGE: z.coerce.number().positive(),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  SPARKPOST_API_KEY: z.string(),
  SPARKPOST_SENDER_ADDRESS: z.string().email(),
  MAPBOX_ACCESS_TOKEN: z.string()
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
 * URL of the CockroachDB database. CockroachDB uses the PostgreSQL wire protocol.
 *
 * @example
 *   'postgres://username:password@localhost/my-database';
 */
export const DATABASE_URL = parsed.data.DATABASE_URL;

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
 *  'pk.abcdefghijklmnopqrstuvwxyz123456';
 * 
 * @see https://docs.mapbox.com/help/how-mapbox-works/access-tokens/
 */

export const MAPBOX_ACCESS_TOKEN = parsed.data.MAPBOX_ACCESS_TOKEN;