import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteCtx) {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "관리자만 가능" }, { status: 403 });

  const { id: matchId } = await params;
  const { homeScore, awayScore, scorers } = await req.json();

  if (homeScore == null || awayScore == null) {
    return NextResponse.json({ error: "스코어를 입력해주세요." }, { status: 400 });
  }

  const actualWinner =
    homeScore > awayScore ? "home" : awayScore > homeScore ? "away" : "draw";

  const predictions = await db.prediction.findMany({
    where: { matchId, status: "PENDING" },
  });

  const updates = predictions.map((p) => {
    const winnerCorrect = p.predictWinner === actualWinner;
    const scoreCorrect =
      p.predictHomeScore === homeScore && p.predictAwayScore === awayScore;
    const scorerCorrect =
      p.predictScorer && scorers?.includes(p.predictScorer);

    let multiplier = 0;
    if (scoreCorrect) {
      multiplier = 5;
    } else if (winnerCorrect) {
      multiplier = 2;
    }
    if (scorerCorrect) multiplier += 1;

    const pointsResult = Math.floor(p.pointsBet * multiplier);
    const status =
      scoreCorrect ? "WON" : winnerCorrect || scorerCorrect ? "PARTIAL" : "LOST";

    return { id: p.id, userId: p.userId, pointsResult, status };
  });

  await db.$transaction([
    db.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        scorers: scorers ?? [],
        status: "FINISHED",
      },
    }),
    ...updates.map((u) =>
      db.prediction.update({
        where: { id: u.id },
        data: { pointsResult: u.pointsResult, status: u.status as "WON" | "PARTIAL" | "LOST" },
      })
    ),
    ...updates
      .filter((u) => u.pointsResult > 0)
      .map((u) =>
        db.user.update({
          where: { id: u.userId },
          data: { points: { increment: u.pointsResult } },
        })
      ),
  ]);

  return NextResponse.json({ message: "결과 처리 완료", processed: updates.length });
}
