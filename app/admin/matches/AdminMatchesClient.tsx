"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchTime: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  predictionCount: number;
};

export default function AdminMatchesClient({ matches: initial }: { matches: Match[] }) {
  const router = useRouter();
  const [matches, setMatches] = useState(initial);
  const [form, setForm] = useState({
    homeTeam: "",
    awayTeam: "",
    league: "",
    matchTime: "",
  });
  const [result, setResult] = useState<Record<string, { homeScore: string; awayScore: string; scorers: string }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createMatch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setForm({ homeTeam: "", awayTeam: "", league: "", matchTime: "" });
    router.refresh();
  }

  async function submitResult(matchId: string) {
    const r = result[matchId];
    if (!r) return;
    const res = await fetch(`/api/matches/${matchId}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeScore: Number(r.homeScore),
        awayScore: Number(r.awayScore),
        scorers: r.scorers ? r.scorers.split(",").map((s) => s.trim()) : [],
      }),
    });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#0f172a] mb-6">경기 관리 (관리자)</h1>

      {/* 경기 등록 */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] p-4 mb-6">
        <h2 className="font-bold text-[#0f172a] mb-4">새 경기 등록</h2>
        <form onSubmit={createMatch} className="grid grid-cols-2 gap-3">
          <input
            placeholder="홈팀"
            value={form.homeTeam}
            onChange={(e) => setForm({ ...form, homeTeam: e.target.value })}
            required
            className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a]"
          />
          <input
            placeholder="원정팀"
            value={form.awayTeam}
            onChange={(e) => setForm({ ...form, awayTeam: e.target.value })}
            required
            className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a]"
          />
          <input
            placeholder="리그 (예: EPL)"
            value={form.league}
            onChange={(e) => setForm({ ...form, league: e.target.value })}
            required
            className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a]"
          />
          <input
            type="datetime-local"
            value={form.matchTime}
            onChange={(e) => setForm({ ...form, matchTime: e.target.value })}
            required
            className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a]"
          />
          {error && (
            <p className="col-span-2 text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="col-span-2 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-medium rounded-lg disabled:opacity-60"
          >
            {loading ? "등록 중..." : "경기 등록"}
          </button>
        </form>
      </div>

      {/* 경기 목록 */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h2 className="font-bold text-[#0f172a]">경기 목록</h2>
        </div>
        {matches.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#64748b] text-sm">등록된 경기가 없습니다.</div>
        ) : (
          <ul className="divide-y divide-[#f1f5f9]">
            {matches.map((m) => (
              <li key={m.id} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs text-[#64748b]">{m.league} · 배팅 {m.predictionCount}명</span>
                    <div className="font-medium text-[#1e293b]">{m.homeTeam} vs {m.awayTeam}</div>
                    <div className="text-xs text-[#64748b]">
                      {new Date(m.matchTime).toLocaleString("ko-KR")} · {m.status}
                      {m.homeScore != null && ` · ${m.homeScore}:${m.awayScore}`}
                    </div>
                  </div>
                </div>

                {m.status === "UPCOMING" && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      placeholder="홈 점수"
                      min={0}
                      className="w-24 px-2 py-1 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#16a34a]"
                      value={result[m.id]?.homeScore ?? ""}
                      onChange={(e) =>
                        setResult((r) => ({ ...r, [m.id]: { ...r[m.id], homeScore: e.target.value } }))
                      }
                    />
                    <input
                      type="number"
                      placeholder="원정 점수"
                      min={0}
                      className="w-24 px-2 py-1 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#16a34a]"
                      value={result[m.id]?.awayScore ?? ""}
                      onChange={(e) =>
                        setResult((r) => ({ ...r, [m.id]: { ...r[m.id], awayScore: e.target.value } }))
                      }
                    />
                    <input
                      placeholder="득점자 (쉼표 구분)"
                      className="flex-1 px-2 py-1 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#16a34a]"
                      value={result[m.id]?.scorers ?? ""}
                      onChange={(e) =>
                        setResult((r) => ({ ...r, [m.id]: { ...r[m.id], scorers: e.target.value } }))
                      }
                    />
                    <button
                      onClick={() => submitResult(m.id)}
                      className="px-3 py-1 bg-[#0f172a] text-white text-sm rounded hover:bg-[#1e293b] transition-colors"
                    >
                      결과 확정
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
