import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Prisma from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: Prisma.PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new Prisma.PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL,
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
