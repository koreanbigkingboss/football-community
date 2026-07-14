import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Sidebar from "@/app/components/Sidebar";

export const dynamic = "force-dynamic";

const LEAGUE_IDS = [
  { id: 4328, name: "EPL" },
  { id: 4335, name: "라리가" },
  { id: 4331, name: "분데스리가" },
  { id: 4332, name: "세리에A" },
  { id: 4480, name: "챔피언스리그" },
  { id: 4456, name: "K리그1" },
];

type SportsDBEvent = {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strLeague: string;
  dateEvent: string;
  strTime: string | null;
};

async function syncUpcomingMatches() {
  try {
    const results = await Promise.all(
      LEAGUE_IDS.map(async ({ id, name }) => {
        const res = await fetch(
          `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${id}`,
          { next: { revalidate: 3600 } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return ((data.events as SportsDBEvent[]) || []).slice(0, 3).map((e) => ({
          ...e,
          leagueName: name,
        }));
      })
    );

    const events = results.flat();
    for (const e of events) {
      const matchTime = new Date(`${e.dateEvent}T${e.strTime ?? "12:00:00"}`);
      if (isNaN(matchTime.getTime())) continue;

      const existing = await db.match.findFirst({
        where: { homeTeam: e.strHomeTeam, awayTeam: e.strAwayTeam },
      });
      if (!existing) {
        await db.match.create({
          data: {
            homeTeam: e.strHomeTeam,
            awayTeam: e.strAwayTeam,
            league: e.leagueName,
            matchTime,
            status: "UPCOMING",
          },
        });
      }
    }
  } catch {
    // 외부 API 실패 시 조용히 무시
  }
}

function formatKST(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
}

export default async function BettingPage() {
  await syncUpcomingMatches();

  const [session, matches] = await Promise.all([
    auth(),
    db.match.findMany({
      where: { status: { in: ["UPCOMING", "LIVE"] } },
      include: { _count: { select: { predictions: true } } },
      orderBy: { matchTime: "asc" },
      take: 30,
    }),
  ]);

  const userId = (session?.user as { id?: string } | undefined)?.id;
  const myPredictions = userId
    ? await db.prediction.findMany({
        where: { userId, matchId: { in: matches.map((m) => m.id) } },
        select: { matchId: true },
      })
    : [];
  const bettedMatchIds = new Set(myPredictions.map((p) => p.matchId));
  const dbUser = userId
    ? await db.user.findUnique({ where: { id: userId }, select: { points: true } })
    : null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
            <div>
              <h1 className="font-bold text-[#0f172a] text-lg">포인트 배팅</h1>
              <p className="text-xs text-[#64748b] mt-0.5">실제 경기 결과를 예측하고 포인트를 획득하세요</p>
            </div>
            {dbUser && (
              <div className="text-right">
                <div className="text-xs text-[#64748b]">보유 포인트</div>
                <div className="text-lg font-bold text-[#16a34a]">{dbUser.points.toLocaleString()}P</div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] text-sm text-[#475569]">
            <span className="font-medium text-[#0f172a]">배팅 규칙:</span>{" "}
            승리팀 예측 <span className="text-[#16a34a] font-medium">2배</span> ·
            정확한 스코어 <span className="text-[#16a34a] font-medium">5배</span> ·
            득점자 추가 <span className="text-[#16a34a] font-medium">+1배</span>
          </div>

          {matches.length === 0 ? (
            <div className="px-4 py-16 text-center text-[#64748b] text-sm">
              현재 배팅 가능한 경기가 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-[#f1f5f9]">
              {matches.map((match) => {
                const betted = bettedMatchIds.has(match.id);
                return (
                  <li key={match.id}>
                    <Link
                      href={`/betting/${match.id}`}
                      className="flex items-center gap-4 px-4 py-4 hover:bg-[#f8fafc] transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#64748b] font-medium mb-1">{match.league}</div>
                        <div className="flex items-center gap-3 text-sm font-semibold text-[#1e293b]">
                          <span className="truncate">{match.homeTeam}</span>
                          <span className="text-[#94a3b8] font-normal text-xs shrink-0">VS</span>
                          <span className="truncate">{match.awayTeam}</span>
                        </div>
                        <div className="text-xs text-[#64748b] mt-1">
                          {formatKST(match.matchTime)} · {match._count.predictions}명 배팅
                        </div>
                      </div>
                      <div className="shrink-0">
                        {betted ? (
                          <span className="text-xs bg-[#dcfce7] text-[#16a34a] px-2 py-1 rounded font-medium">배팅완료</span>
                        ) : !session?.user ? (
                          <span className="text-xs text-[#94a3b8]">로그인 필요</span>
                        ) : (
                          <span className="text-xs bg-[#16a34a] text-white px-2 py-1 rounded group-hover:bg-[#15803d] transition-colors">배팅하기</span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {userId && <MyBettingHistory userId={userId} />}
      </div>
    </main>
  );
}

async function MyBettingHistory({ userId }: { userId: string }) {
  const history = await db.prediction.findMany({
    where: { userId },
    include: {
      match: { select: { homeTeam: true, awayTeam: true, homeScore: true, awayScore: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  if (history.length === 0) return null;

  const statusLabel: Record<string, string> = { PENDING: "진행중", WON: "적중", PARTIAL: "일부적중", LOST: "낙첨" };
  const statusColor: Record<string, string> = {
    PENDING: "text-[#64748b]", WON: "text-[#16a34a] font-medium",
    PARTIAL: "text-blue-600 font-medium", LOST: "text-red-500",
  };

  return (
    <div className="mt-4 bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e2e8f0]">
        <h2 className="font-bold text-[#0f172a]">내 배팅 이력</h2>
      </div>
      <ul className="divide-y divide-[#f1f5f9]">
        {history.map((p) => (
          <li key={p.id} className="px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium text-[#1e293b]">{p.match.homeTeam} vs {p.match.awayTeam}</div>
              <div className="text-xs text-[#64748b] mt-0.5">
                {p.predictWinner === "home" ? p.match.homeTeam : p.predictWinner === "away" ? p.match.awayTeam : "무승부"} 예측
                {p.predictHomeScore != null && ` (${p.predictHomeScore}:${p.predictAwayScore})`}
              </div>
            </div>
            <div className="text-right">
              <div className={statusColor[p.status]}>{statusLabel[p.status]}</div>
              <div className="text-xs text-[#64748b]">
                -{p.pointsBet.toLocaleString()}P
                {p.pointsResult != null && p.pointsResult > 0 && (
                  <span className="text-[#16a34a]"> +{p.pointsResult.toLocaleString()}P</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
