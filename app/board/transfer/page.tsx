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

type FotMobRawTransfer = {
  id?: string | number;
  player?: { name?: string; position?: string; positionLabel?: string };
  name?: string;
  fromTeam?: { name?: string; shortName?: string };
  toTeam?: { name?: string; shortName?: string };
  from?: { name?: string } | string;
  to?: { name?: string } | string;
  fee?: string | { value?: string; text?: string };
  transferDate?: string;
  date?: string;
  position?: string;
  type?: string;
};

function parseName(raw: { name?: string } | string | undefined): string {
  if (!raw) return "-";
  if (typeof raw === "string") return raw;
  return raw.name ?? "-";
}

function parseFee(raw: string | { value?: string; text?: string } | undefined): string {
  if (!raw) return "미공개";
  if (typeof raw === "string") return raw || "미공개";
  return raw.text ?? raw.value ?? "미공개";
}

async function fetchFotMobTransfers(): Promise<Transfer[]> {
  const ENDPOINTS = [
    "https://www.fotmob.com/api/transfers?lang=default",
    "https://www.fotmob.com/api/transfers",
  ];

  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          Referer: "https://www.fotmob.com/transfers",
          "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        },
        next: { revalidate: 3600 },
      });

      if (!res.ok) continue;

      const data = await res.json();

      // 여러 응답 구조 처리
      const raw: FotMobRawTransfer[] =
        data?.transfers?.data ??
        data?.transfers?.items ??
        data?.data?.transfers ??
        data?.data ??
        data?.transfers ??
        data?.items ??
        [];

      if (!Array.isArray(raw) || raw.length === 0) continue;

      return raw.slice(0, 30).flatMap((t): Transfer[] => {
        const name = t.player?.name ?? t.name;
        if (!name) return [];
        return [
          {
            id: String(t.id ?? Math.random()),
            name,
            from: parseName(t.fromTeam ?? t.from),
            to: parseName(t.toTeam ?? t.to),
            fee: parseFee(t.fee),
            date: t.transferDate ?? t.date ?? "",
            position: t.player?.positionLabel ?? t.player?.position ?? t.position ?? "",
          },
        ];
      });
    } catch {
      continue;
    }
  }

  return [];
}

export default async function TransferPage() {
  const transfers = await fetchFotMobTransfers();

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h1 className="font-bold text-[#0f172a] text-lg">이적시장</h1>
            <p className="text-xs text-[#64748b] mt-0.5">FotMob 최신 이적</p>
          </div>

          {transfers.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="text-[#64748b] text-sm">이적 정보를 불러오는 중입니다...</div>
              <div className="text-xs text-[#94a3b8] mt-2">FotMob 데이터 연결 중</div>
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
