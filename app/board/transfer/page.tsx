import Sidebar from "@/app/components/Sidebar";

export const dynamic = "force-dynamic";

type Transfer = {
  id: string;
  name: string;
  from: string;
  to: string;
  fee: string;
};

function parseTransfers(html: string): Transfer[] {
  const transfers: Transfer[] = [];
  const seen = new Set<string>();

  // Split by table rows
  const rows = html.split("</tr>");

  for (const row of rows) {
    // Player name: text link to /profil/spieler/
    const playerMatches = [
      ...row.matchAll(/href="\/[^"]+\/profil\/spieler\/\d+"[^>]*>([^<]+)<\/a>/g),
    ];
    // Club names: text links to /startseite/verein/
    const clubMatches = [
      ...row.matchAll(/href="\/[^"]+\/startseite\/verein\/\d+[^"]*"[^>]*>([^<]+)<\/a>/g),
    ];
    // Fee: link to /jumplist/transfers/
    const feeMatch = row.match(
      /href="[^"]*\/jumplist\/transfers[^"]*"[^>]*>([^<]+)<\/a>/
    );

    if (playerMatches.length > 0 && clubMatches.length >= 2) {
      const player = playerMatches[0][1].trim();
      const from = clubMatches[0][1].trim();
      const to = clubMatches[1][1].trim();
      const fee = feeMatch ? feeMatch[1].trim() : "미공개";

      const key = `${player}|${from}|${to}`;
      if (!seen.has(key) && player.length > 1 && from.length > 1 && to.length > 1) {
        seen.add(key);
        transfers.push({ id: key, name: player, from, to, fee });
      }
    }
  }

  return transfers.slice(0, 30);
}

async function fetchTransfers(): Promise<Transfer[]> {
  try {
    const res = await fetch(
      "https://www.transfermarkt.co.kr/statistik/neuestetransfers",
      {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
          Referer: "https://www.transfermarkt.co.kr/",
        },
      }
    );
    if (!res.ok) return [];
    const html = await res.text();
    return parseTransfers(html);
  } catch {
    return [];
  }
}

export default async function TransferPage() {
  const transfers = await fetchTransfers();

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h1 className="font-bold text-[#0f172a] text-lg">이적시장</h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              Transfermarkt 최근 이적 오피셜
            </p>
          </div>

          {transfers.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="text-[#64748b] text-sm">
                이적 정보를 불러오는 중입니다...
              </div>
              <div className="text-xs text-[#94a3b8] mt-2">
                Transfermarkt 연결 중
              </div>
            </div>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-[2fr_2fr_2fr_1fr] px-4 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] text-xs text-[#64748b] font-medium">
                <span>선수</span>
                <span>이전 구단 → 새 구단</span>
                <span></span>
                <span className="text-right">이적료</span>
              </div>
              <ul className="divide-y divide-[#f1f5f9]">
                {transfers.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-[#f1f5f9] shrink-0 flex items-center justify-center text-[#94a3b8] text-sm font-bold">
                      {t.name[0]}
                    </div>
                    <div className="flex-1 sm:grid sm:grid-cols-[2fr_2fr_2fr_1fr] items-center gap-2 min-w-0">
                      <div className="font-medium text-[#1e293b] text-sm truncate">
                        {t.name}
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-sm text-[#475569] truncate col-span-2">
                        <span className="truncate">{t.from}</span>
                        <span className="text-[#16a34a] shrink-0">→</span>
                        <span className="truncate">{t.to}</span>
                      </div>
                      <div className="sm:hidden text-xs text-[#64748b] truncate">
                        {t.from} → {t.to}
                      </div>
                      <div className="hidden sm:block text-sm font-medium text-[#0f172a] text-right">
                        {t.fee}
                      </div>
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
