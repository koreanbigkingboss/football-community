import Sidebar from "@/app/components/Sidebar";

export const dynamic = "force-dynamic";

type Transfer = {
  id: string;
  name: string;
  from: string;
  to: string;
  fee: string;
  date: string;
  position: string;
};

// 주요 구단 ID (Real Madrid, Man City, Barcelona, Arsenal, PSG, Bayern, Liverpool, Chelsea)
const TOP_CLUBS = [
  { id: "418", name: "레알마드리드" },
  { id: "281", name: "맨체스터시티" },
  { id: "131", name: "바르셀로나" },
  { id: "11",  name: "아스날" },
  { id: "583", name: "파리생제르맹" },
  { id: "27",  name: "바이에른뮌헨" },
  { id: "31",  name: "리버풀" },
  { id: "631", name: "첼시" },
];

type TmTransfer = {
  id?: string;
  name?: string;
  from?: { name?: string };
  to?: { name?: string };
  fee?: string;
  date?: string;
  position?: string;
};

async function fetchClubTransfers(clubId: string, clubName: string): Promise<Transfer[]> {
  try {
    const res = await fetch(
      `https://transfermarkt-api.fly.dev/clubs/${clubId}/transfers`,
      {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; football-community/1.0)",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();

    const arrivals: TmTransfer[] = data?.arrivals ?? [];
    const departures: TmTransfer[] = data?.departures ?? [];
    const name: string = data?.name ?? clubName;

    const incoming = arrivals.slice(0, 2).map((t) => ({
      id: `${clubId}-a-${t.id ?? t.name}`,
      name: t.name ?? "Unknown",
      from: t.from?.name ?? "-",
      to: name,
      fee: t.fee ?? "미공개",
      date: t.date ?? "",
      position: t.position ?? "",
    }));

    const outgoing = departures.slice(0, 1).map((t) => ({
      id: `${clubId}-d-${t.id ?? t.name}`,
      name: t.name ?? "Unknown",
      from: name,
      to: t.to?.name ?? "-",
      fee: t.fee ?? "미공개",
      date: t.date ?? "",
      position: t.position ?? "",
    }));

    return [...incoming, ...outgoing];
  } catch {
    return [];
  }
}

export default async function TransferPage() {
  const results = await Promise.all(
    TOP_CLUBS.map((c) => fetchClubTransfers(c.id, c.name))
  );
  const transfers = results
    .flat()
    .filter((t) => t.name !== "Unknown")
    .sort((a, b) => (b.date > a.date ? 1 : -1))
    .slice(0, 30);

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h1 className="font-bold text-[#0f172a] text-lg">이적시장</h1>
            <p className="text-xs text-[#64748b] mt-0.5">Transfermarkt 오피셜 이적</p>
          </div>

          {transfers.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="text-[#64748b] text-sm">이적 정보를 불러오는 중입니다...</div>
              <div className="text-xs text-[#94a3b8] mt-2">Transfermarkt 연결 중</div>
            </div>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-[2fr_2fr_2fr_1fr] px-4 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] text-xs text-[#64748b] font-medium">
                <span>선수</span>
                <span>이전 구단 → 새 구단</span>
                <span>날짜</span>
                <span className="text-right">이적료</span>
              </div>
              <ul className="divide-y divide-[#f1f5f9]">
                {transfers.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-[#f1f5f9] shrink-0 flex items-center justify-center text-[#94a3b8] text-sm font-bold">
                      {t.name[0]}
                    </div>
                    <div className="flex-1 sm:grid sm:grid-cols-[2fr_2fr_2fr_1fr] items-center gap-2 min-w-0">
                      <div>
                        <div className="font-medium text-[#1e293b] text-sm truncate">{t.name}</div>
                        {t.position && <div className="text-xs text-[#94a3b8]">{t.position}</div>}
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-sm text-[#475569] truncate">
                        <span className="truncate">{t.from}</span>
                        <span className="text-[#16a34a] shrink-0">→</span>
                        <span className="truncate">{t.to}</span>
                      </div>
                      <div className="sm:hidden text-xs text-[#64748b] truncate">
                        {t.from} → {t.to}
                      </div>
                      <div className="hidden sm:block text-sm text-[#64748b]">{t.date}</div>
                      <div className="hidden sm:block text-sm font-medium text-[#0f172a] text-right">{t.fee}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
