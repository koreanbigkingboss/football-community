"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchTime: string;
  status: string;
  homeTeamBadge?: string;
  awayTeamBadge?: string;
};

type Existing = {
  predictWinner: string;
  predictHomeScore: number | null;
  predictAwayScore: number | null;
  predictScorer: string | null;
  pointsBet: number;
  status: string;
  pointsResult: number | null;
} | null;

export default function BettingForm({
  match,
  userPoints,
  existing,
}: {
  match: Match;
  userPoints: number;
  existing: Existing;
}) {
  const router = useRouter();
  const [winner, setWinner] = useState(existing?.predictWinner ?? "");
  const [homeScore, setHomeScore] = useState(
    existing?.predictHomeScore?.toString() ?? ""
  );
  const [awayScore, setAwayScore] = useState(
    existing?.predictAwayScore?.toString() ?? ""
  );
  const [scorer, setScorer] = useState(existing?.predictScorer ?? "");
  const [points, setPoints] = useState(existing?.pointsBet?.toString() ?? "50");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const matchTime = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(match.matchTime));

  const isLocked = existing !== null || match.status !== "UPCOMING";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!winner) { setError("승패를 선택해주세요."); return; }
    const bet = Number(points);
    if (isNaN(bet) || bet < 50) { setError("최소 50포인트부터 배팅 가능합니다."); return; }
    if (bet > userPoints) { setError("포인트가 부족합니다."); return; }

    setError("");
    setLoading(true);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: match.id,
        predictWinner: winner,
        predictHomeScore: homeScore !== "" ? Number(homeScore) : null,
        predictAwayScore: awayScore !== "" ? Number(awayScore) : null,
        predictScorer: scorer || null,
        pointsBet: bet,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "오류가 발생했습니다."); return; }
    router.push("/betting");
    router.refresh();
  }

  const statusMap: Record<string, string> = {
    PENDING: "진행중",
    WON: "적중",
    PARTIAL: "일부적중",
    LOST: "낙첨",
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
        {/* 경기 정보 헤더 */}
        <div className="px-4 py-4 border-b border-[#e2e8f0] bg-[#0f172a] text-white">
          <div className="text-xs text-[#94a3b8] mb-2 text-center">{match.league}</div>
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="flex flex-col items-center gap-2 flex-1">
              {match.homeTeamBadge ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.homeTeamBadge} alt={match.homeTeam} className="w-12 h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                  {match.homeTeam.charAt(0)}
                </div>
              )}
              <span className="text-sm font-bold text-center leading-tight">{match.homeTeam}</span>
            </div>
            <span className="text-[#94a3b8] font-medium text-sm shrink-0">VS</span>
            <div className="flex flex-col items-center gap-2 flex-1">
              {match.awayTeamBadge ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.awayTeamBadge} alt={match.awayTeam} className="w-12 h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                  {match.awayTeam.charAt(0)}
                </div>
              )}
              <span className="text-sm font-bold text-center leading-tight">{match.awayTeam}</span>
            </div>
          </div>
          <div className="text-center text-xs text-[#94a3b8] mt-1">{matchTime}</div>
        </div>

        <div className="p-4">
          {/* 이미 배팅한 경우 */}
          {existing ? (
            <div className="space-y-3">
              <div className={`text-center py-2 rounded-lg text-sm font-medium ${
                existing.status === "WON" ? "bg-[#dcfce7] text-[#16a34a]"
                : existing.status === "PARTIAL" ? "bg-blue-50 text-blue-600"
                : existing.status === "LOST" ? "bg-red-50 text-red-500"
                : "bg-[#f8fafc] text-[#64748b]"
              }`}>
                {statusMap[existing.status]}
                {existing.pointsResult != null && existing.pointsResult > 0 && ` · +${existing.pointsResult.toLocaleString()}P 획득`}
              </div>

              <div className="bg-[#f8fafc] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">승패 예측</span>
                  <span className="font-medium">
                    {existing.predictWinner === "home" ? match.homeTeam
                      : existing.predictWinner === "away" ? match.awayTeam
                      : "무승부"}
                  </span>
                </div>
                {existing.predictHomeScore != null && (
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">스코어 예측</span>
                    <span className="font-medium">{existing.predictHomeScore} : {existing.predictAwayScore}</span>
                  </div>
                )}
                {existing.predictScorer && (
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">득점 예측</span>
                    <span className="font-medium">{existing.predictScorer}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#e2e8f0]">
                  <span className="text-[#64748b]">배팅 포인트</span>
                  <span className="font-bold text-[#0f172a]">{existing.pointsBet.toLocaleString()}P</span>
                </div>
              </div>

              <Link href="/betting" className="block text-center text-sm text-[#16a34a] hover:underline mt-2">
                ← 배팅 목록으로
              </Link>
            </div>
          ) : match.status !== "UPCOMING" ? (
            <div className="text-center py-8 text-[#64748b] text-sm">
              배팅이 종료된 경기입니다.
              <br />
              <Link href="/betting" className="text-[#16a34a] hover:underline mt-2 inline-block">
                ← 배팅 목록으로
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 보유 포인트 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#64748b]">보유 포인트</span>
                <span className="font-bold text-[#0f172a]">{userPoints.toLocaleString()}P</span>
              </div>

              {/* 승패 예측 */}
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-2">
                  승패 예측 <span className="text-[#16a34a]">*</span>
                  <span className="text-xs text-[#64748b] ml-1">(적중 시 2배)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "home", label: match.homeTeam },
                    { value: "draw", label: "무승부" },
                    { value: "away", label: match.awayTeam },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setWinner(opt.value)}
                      className={`py-2.5 px-2 rounded-lg border text-sm font-medium transition-colors ${
                        winner === opt.value
                          ? "bg-[#16a34a] border-[#16a34a] text-white"
                          : "border-[#e2e8f0] text-[#475569] hover:border-[#16a34a] hover:text-[#16a34a]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 스코어 예측 (선택) */}
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-2">
                  스코어 예측 <span className="text-xs text-[#64748b]">(선택, 적중 시 5배)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    placeholder="홈"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-center focus:outline-none focus:border-[#16a34a]"
                  />
                  <span className="text-[#64748b] font-medium shrink-0">:</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    placeholder="원정"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-center focus:outline-none focus:border-[#16a34a]"
                  />
                </div>
              </div>

              {/* 득점자 예측 (선택) */}
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-2">
                  득점자 예측 <span className="text-xs text-[#64748b]">(선택, 적중 시 +1배)</span>
                </label>
                <input
                  type="text"
                  placeholder="선수 이름 입력"
                  value={scorer}
                  onChange={(e) => setScorer(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a]"
                />
              </div>

              {/* 배팅 포인트 */}
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-2">
                  배팅 포인트 <span className="text-[#16a34a]">*</span>
                  <span className="text-xs text-[#64748b] ml-1">(최소 50P)</span>
                </label>
                <input
                  type="number"
                  min={50}
                  max={userPoints}
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a]"
                />
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPoints(Math.min(v, userPoints).toString())}
                      className="flex-1 py-1.5 border border-[#e2e8f0] text-xs text-[#64748b] rounded hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
                    >
                      +{v.toLocaleString()}P
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPoints(userPoints.toString())}
                    className="flex-1 py-1.5 border border-[#e2e8f0] text-xs text-[#64748b] rounded hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
                  >
                    전부
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-2">
                <Link
                  href="/betting"
                  className="flex-1 py-2.5 border border-[#e2e8f0] text-[#64748b] text-sm rounded-lg hover:bg-[#f8fafc] transition-colors text-center"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={loading || !winner}
                  className="flex-1 py-2.5 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {loading ? "배팅 중..." : "배팅하기"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
