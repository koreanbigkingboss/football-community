import Sidebar from "@/app/components/Sidebar";

type Transfer = {
  id: string;
  playerName: string;
  from: string;
  to: string;
  fee: string;
  season: string;
  playerImage?: string;
};

async function fetchTransfers(): Promise<Transfer[]> {
  try {
    const res = await fetch(
      "https://transfermarkt-api.fly.dev/transfers/recents?top=20",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const list = data?.transfers ?? data?.items ?? [];
    return list.map(
      (t: {
        id?: string;
        playerName?: string;
        player?: { name?: string; id?: string; imageUrl?: string };
        fromClub?: { name?: string };
        toClub?: { name?: string };
        fee?: { value?: string; currency?: string };
        season?: string;
      }) => ({
        id: t.id ?? t.player?.id ?? Math.random().toString(),
        playerName: t.playerName ?? t.player?.name ?? "Unknown",
        from: t.fromClub?.name ?? "Unknown",
        to: t.toClub?.name ?? "Unknown",
        fee: t.fee?.value ? `${t.fee.currency ?? "€"}${t.fee.value}` : "미공개",
        season: t.season ?? "-",
        playerImage: t.player?.imageUrl,
      })
    );
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function TransferPage() {
  const transfers = await fetchTransfers();

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
            <div>
              <h1 className="font-bold text-[#0f172a] text-lg">이적시장</h1>
              <p className="text-xs text-[#64748b] mt-0.5">Transfermarkt 오피셜 이적</p>
            </div>
          </div>

          {transfers.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="text-[#64748b] text-sm">이적 정보를 불러오는 중입니다...</div>
              <div className="text-xs text-[#94a3b8] mt-2">Transfermarkt API 연결 중</div>
            </div>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-[2fr_2fr_2fr_1fr_1fr] px-4 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] text-xs text-[#64748b] font-medium">
                <span>선수</span>
                <span>출발 클럽</span>
                <span>도착 클럽</span>
                <span className="text-center">이적료</span>
                <span className="text-center">시즌</span>
              </div>
              <ul className="divide-y divide-[#f1f5f9]">
                {transfers.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    {t.playerImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.playerImage}
                        alt={t.playerName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 bg-[#f1f5f9]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#f1f5f9] shrink-0 flex items-center justify-center text-[#94a3b8] text-xs">
                        👤
                      </div>
                    )}
                    <div className="grid flex-1 sm:grid-cols-[2fr_2fr_2fr_1fr_1fr] items-center gap-1">
                      <span className="font-medium text-[#1e293b] text-sm truncate">{t.playerName}</span>
                      <div className="hidden sm:flex items-center gap-1 text-sm text-[#475569] truncate">
                        <span className="text-red-400">→</span>
                        {t.from}
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-sm text-[#475569] truncate">
                        <span className="text-[#16a34a]">→</span>
                        {t.to}
                      </div>
                      <div className="sm:hidden text-xs text-[#64748b] truncate">
                        {t.from} → {t.to}
                      </div>
                      <span className="hidden sm:block text-center text-sm font-medium text-[#0f172a]">{t.fee}</span>
                      <span className="hidden sm:block text-center text-xs text-[#64748b]">{t.season}</span>
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
