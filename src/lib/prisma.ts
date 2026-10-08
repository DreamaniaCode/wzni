import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
export function database() {
  if (!process.env.DATABASE_URL) throw new Error("STORE_UNCONFIGURED");
  if (!globalDb.prisma)
    globalDb.prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
        max: 10,
      }),
    });
  return globalDb.prisma;
}
