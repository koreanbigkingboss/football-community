import { NextResponse } from "next/server";

export async function GET() {
  // DATABASE 관련 환경변수 키 전체 목록
  const allKeys = Object.keys(process.env).filter(
    (k) => k.includes("DATABASE") || k.includes("DB") || k.includes("POSTGRES") || k.includes("AUTH") || k.includes("NEON")
  );

  const url = process.env.DATABASE_URL;

  let dbTest = "not attempted";
  try {
    const { db } = await import("@/lib/db");
    await db.$queryRaw`SELECT 1`;
    dbTest = "success";
  } catch (e: unknown) {
    dbTest = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    DATABASE_URL: url ? `SET (${url.slice(0, 40)}...)` : "NOT SET",
    relatedEnvKeys: allKeys,
    NODE_ENV: process.env.NODE_ENV,
    dbConnection: dbTest,
  });
}
