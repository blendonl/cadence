import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { createAuthMiddleware } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { expo } from '@better-auth/expo';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getTrustedOrigins = () => {
  const origins = [
    'cadence://',
    ...(process.env.NODE_ENV !== 'production' ? ['exp://'] : []),
  ];

  // Add configured trusted origins from environment
  if (process.env.TRUSTED_ORIGINS) {
    origins.push(...process.env.TRUSTED_ORIGINS.split(',').map(o => o.trim()));
  }

  // Default development origins
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:*', 'http://127.0.0.1:*');
  }

  return origins;
};

/**
 * Plugin to support CLI/TUI OAuth flows via localhost callbacks.
 * Appends the session cookie as a query parameter to localhost redirect URLs,
 * similar to what the expo plugin does for native app deep-link schemes.
 */
const cliAuth = () => ({
  id: 'cli-auth',
  hooks: {
    after: [
      {
        matcher(context: { path?: string }) {
          return context.path?.startsWith('/callback') ?? false;
        },
        handler: createAuthMiddleware(async (ctx) => {
          const headers = ctx.context.responseHeaders;
          const location = headers?.get('location');
          if (!location) return;
          if (
            !location.startsWith('http://localhost:') &&
            !location.startsWith('http://127.0.0.1:')
          )
            return;
          const cookie = headers?.get('set-cookie');
          if (!cookie) return;
          const url = new URL(location);
          url.searchParams.set('cookie', cookie);
          ctx.setHeader('location', url.toString());
        }),
      },
    ],
  },
});

export const auth = betterAuth({
  basePath: '/api/auth',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: getTrustedOrigins(),
  account: {
    skipStateCookieCheck: true,
  },
  plugins: [expo(), bearer(), cliAuth()],
});
