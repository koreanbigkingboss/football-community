import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import BettingForm from "./BettingForm";

export default async function BettingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?next=/betting/${id}`);

  const userId = (session.user as { id?: string }).id!;

  const [match, dbUser, existing] = await Promise.all([
    db.match.findUnique({ where: { id } }),
    db.user.findUnique({ where: { id: userId }, select: { points: true } }),
    db.prediction.findUnique({ where: { userId_matchId: { userId, matchId: id } } }),
  ]);

  if (!match) notFound();

  return (
    <BettingForm
      match={{
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        matchTime: match.matchTime.toISOString(),
        status: match.status,
      }}
      userPoints={dbUser?.points ?? 0}
      existing={
        existing
          ? {
              predictWinner: existing.predictWinner,
              predictHomeScore: existing.predictHomeScore,
              predictAwayScore: existing.predictAwayScore,
              predictScorer: existing.predictScorer,
              pointsBet: existing.pointsBet,
              status: existing.status,
              pointsResult: existing.pointsResult,
            }
          : null
      }
    />
  );
}
