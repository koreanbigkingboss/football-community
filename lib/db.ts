import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL ?? "";
  const connectionString = rawUrl.replace("&channel_binding=require", "");
  const adapter = new PrismaNeonHttp(connectionString, {});
  return new PrismaClient({ adapter } as never);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;
