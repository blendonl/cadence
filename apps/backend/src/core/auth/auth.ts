import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { expo } from '@better-auth/expo';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  basePath: '/api/auth',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    'cadence://',
    ...(process.env.NODE_ENV !== 'production' ? ['exp://'] : []),
  ],
  plugins: [expo()],
});
