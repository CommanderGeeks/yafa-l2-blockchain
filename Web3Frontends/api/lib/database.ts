import { PrismaClient } from '@prisma/client';

declare global {
  var __db__: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
let db: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  db = global.__db__;
}

export { db };