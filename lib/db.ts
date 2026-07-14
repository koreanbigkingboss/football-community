import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

function createPrismaClient() {
  // pg 드라이버가 channel_binding을 지원하지 않으므로 제거
  const rawUrl = process.env.DATABASE_URL ?? "";
  const connectionString = rawUrl
    .replace("&channel_binding=require", "")
    .replace("?channel_binding=require&", "?")
    .replace("?channel_binding=require", "");

  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as never);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;
