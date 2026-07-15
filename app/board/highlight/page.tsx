import Sidebar from "@/app/components/Sidebar";
import HighlightPlayer from "./HighlightPlayer";

export const dynamic = "force-dynamic";

export type VideoItem = {
  embedSrc: string;
  title: string;
  thumbnail: string;
  competition: string;
  date: string;
};

type ScorebatVideo = {
  id: string;
  title: string;
  embed: string;
};

type ScorebatMatch = {
  title: string;
  competition: string;
  date: string;
  thumbnail?: string;
  videos?: ScorebatVideo[];
  video_embed?: string;
};

const TARGET_KEYWORDS = [
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "Champions League",
  "K League",
];

function isTargetCompetition(competition: string): boolean {
  return TARGET_KEYWORDS.some((kw) => competition.includes(kw));
}

function extractEmbedSrc(embedHtml: string): string {
  const m = embedHtml.match(
    /src=['"](https:\/\/www\.scorebat\.com\/embed\/[^'"]+)['"]/
  );
  return m ? m[1] : "";
}

async function fetchHighlights(): Promise<VideoItem[]> {
  try {
    const res = await fetch("https://www.scorebat.com/video-api/v3/", {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items: ScorebatMatch[] = Array.isArray(json)
      ? json
      : (json.response ?? json.data ?? []);

    return items
      .filter((m) => isTargetCompetition(m.competition ?? ""))
      .map((m) => {
        const embedHtml = m.videos?.[0]?.embed ?? m.video_embed ?? "";
        const embedSrc = extractEmbedSrc(embedHtml);
        return {
          embedSrc,
          title: m.title ?? "",
          thumbnail: m.thumbnail ?? "",
          competition: m.competition ?? "",
          date: m.date
            ? new Date(m.date).toLocaleDateString("ko-KR")
            : "",
        };
      })
      .filter((v) => v.embedSrc && v.title)
      .slice(0, 24);
  } catch {
    return [];
  }
}

const COMPETITION_LABEL: Record<string, string> = {
  "ENGLAND: Premier League": "EPL",
  "SPAIN: La Liga": "라리가",
  "GERMANY: Bundesliga": "분데스리가",
  "ITALY: Serie A": "세리에A",
  "FRANCE: Ligue 1": "리그앙",
  "EUROPE: Champions League": "UCL",
  "EUROPE: UEFA Champions League": "UCL",
};

function competitionLabel(competition: string): string {
  return COMPETITION_LABEL[competition] ?? competition.split(": ").pop() ?? competition;
}

export default async function HighlightPage() {
  const highlights = await fetchHighlights();

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h1 className="font-bold text-[#0f172a] text-lg">하이라이트</h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              5대리그 · UCL 경기 하이라이트
            </p>
          </div>

          {highlights.length === 0 ? (
            <div className="px-4 py-16 text-center text-[#64748b] text-sm">
              하이라이트를 불러오는 중입니다...
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map((h, i) => (
                <HighlightPlayer
                  key={`${h.embedSrc}-${i}`}
                  highlight={{ ...h, competition: competitionLabel(h.competition) }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
