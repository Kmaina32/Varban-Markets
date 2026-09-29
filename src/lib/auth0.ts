
import { Auth0Client } from '@auth0/nextjs-auth0/server';

/**
 * @fileOverview Auth0 Client Initialization (v4).
 * Reads configuration from environment variables automatically.
 */

export const auth0 = new Auth0Client();
