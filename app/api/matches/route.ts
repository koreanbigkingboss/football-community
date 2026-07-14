import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const matches = await db.match.findMany({
    where: { status: { in: ["UPCOMING", "LIVE"] } },
    include: { _count: { select: { predictions: true } } },
    orderBy: { matchTime: "asc" },
  });
  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "관리자만 가능" }, { status: 403 });

  const { homeTeam, awayTeam, league, matchTime } = await req.json();
  if (!homeTeam || !awayTeam || !league || !matchTime) {
    return NextResponse.json({ error: "모든 필드를 입력해주세요." }, { status: 400 });
  }

  const match = await db.match.create({
    data: { homeTeam, awayTeam, league, matchTime: new Date(matchTime) },
  });
  return NextResponse.json(match, { status: 201 });
}
