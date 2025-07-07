import { PrismaClient } from '@prisma/client';


//type-casting the global object to have a specific structure that can store a Prisma client.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In development, when your server restarts(due to nodemon due to changes), it reuses the same Prismaclient(connections) instead of creating new ones
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
