import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import AdminMatchesClient from "./AdminMatchesClient";

export default async function AdminMatchesPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const dbUser = await db.user.findUnique({ where: { id: userId } });
  if (dbUser?.role !== "ADMIN") redirect("/");

  const matches = await db.match.findMany({
    include: { _count: { select: { predictions: true } } },
    orderBy: { matchTime: "desc" },
  });

  return (
    <AdminMatchesClient
      matches={matches.map((m) => ({
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        league: m.league,
        matchTime: m.matchTime.toISOString(),
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        predictionCount: m._count.predictions,
      }))}
    />
  );
}
