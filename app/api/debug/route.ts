import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.DATABASE_URL;
  const authSecret = process.env.AUTH_SECRET;

  let dbTest = "not attempted";
  try {
    const { db } = await import("@/lib/db");
    await db.$queryRaw`SELECT 1`;
    dbTest = "success";
  } catch (e: unknown) {
    dbTest = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    DATABASE_URL: url ? `SET (starts with: ${url.slice(0, 30)}...)` : "NOT SET",
    AUTH_SECRET: authSecret ? "SET" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    dbConnection: dbTest,
  });
}
