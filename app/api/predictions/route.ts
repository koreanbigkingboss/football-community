import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { matchId, predictWinner, predictHomeScore, predictAwayScore, predictScorer, pointsBet } =
    await req.json();

  if (!matchId || !predictWinner || !pointsBet) {
    return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
  }
  if (!["home", "away", "draw"].includes(predictWinner)) {
    return NextResponse.json({ error: "승패 예측이 올바르지 않습니다." }, { status: 400 });
  }
  if (pointsBet < 50) {
    return NextResponse.json({ error: "최소 50포인트부터 배팅 가능합니다." }, { status: 400 });
  }

  const [dbUser, match, existing] = await Promise.all([
    db.user.findUnique({ where: { id: user.id } }),
    db.match.findUnique({ where: { id: matchId } }),
    db.prediction.findUnique({ where: { userId_matchId: { userId: user.id, matchId } } }),
  ]);

  if (!dbUser) return NextResponse.json({ error: "사용자 없음" }, { status: 404 });
  if (!match) return NextResponse.json({ error: "경기 없음" }, { status: 404 });
  if (match.status !== "UPCOMING") {
    return NextResponse.json({ error: "배팅이 종료된 경기입니다." }, { status: 400 });
  }
  if (existing) {
    return NextResponse.json({ error: "이미 배팅한 경기입니다." }, { status: 409 });
  }
  if (dbUser.points < pointsBet) {
    return NextResponse.json({ error: "포인트가 부족합니다." }, { status: 400 });
  }

  const [prediction] = await db.$transaction([
    db.prediction.create({
      data: {
        userId: user.id,
        matchId,
        predictWinner,
        predictHomeScore: predictHomeScore ?? null,
        predictAwayScore: predictAwayScore ?? null,
        predictScorer: predictScorer ?? null,
        pointsBet,
      },
    }),
    db.user.update({ where: { id: user.id }, data: { points: { decrement: pointsBet } } }),
  ]);

  return NextResponse.json(prediction, { status: 201 });
}
