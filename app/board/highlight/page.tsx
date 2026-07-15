import Sidebar from "@/app/components/Sidebar";
import HighlightPlayer from "./HighlightPlayer";

export const dynamic = "force-dynamic";

type VideoItem = {
  videoId: string;
  title: string;
  thumbnail: string;
  published: string;
  channel: string;
};

// 5대리그 + UCL + K리그 공식 YouTube 채널
const CHANNELS = [
  { id: "UCqZQlzSHbVJrwrn5XvzrzcA", name: "프리미어리그" },
  { id: "UCTFNGq5eMKRKN0i7h1vPSMw", name: "라리가" },
  { id: "UCGSbmA1eLbBjz_cKlFfJBqg", name: "분데스리가" },
  { id: "UCBJeMCIeLQos7wacox4hmLQ", name: "세리에A" },
  { id: "UC3vTOqc0vQYQA6R0r38xJ4w", name: "리그앙" },
  { id: "UCwc7FMSzr8e-Vo72V8Rp63A", name: "UEFA" },
  { id: "UCrfu1VaYOZ_-FBGQMzKFfMA", name: "K리그" },
];

// 경기 하이라이트 영상인지 판별
function isMatchHighlight(title: string): boolean {
  const lower = title.toLowerCase();
  return (
    lower.includes("highlight") ||
    lower.includes("하이라이트") ||
    lower.includes("all goals") ||
    lower.includes("extended") ||
    lower.includes("match report") ||
    lower.includes("matchday") ||
    lower.includes("goals") ||
    /\d\s*[-–|]\s*\d/.test(title)
  );
}

async function fetchChannelVideos(channelId: string, channelName: string): Promise<VideoItem[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    const text = await res.text();

    const entries = text.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];
    return entries.flatMap((entry) => {
      const videoId = (entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/) ?? [])[1];
      const rawTitle = (entry.match(/<title>(.*?)<\/title>/) ?? [])[1] ?? "";
      const published = (entry.match(/<published>(.*?)<\/published>/) ?? [])[1] ?? "";

      if (!videoId) return [];

      const title = rawTitle
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");

      if (!isMatchHighlight(title)) return [];

      return [
        {
          videoId,
          title,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          published: published ? new Date(published).toLocaleDateString("ko-KR") : "",
          channel: channelName,
        },
      ];
    });
  } catch {
    return [];
  }
}

export default async function HighlightPage() {
  const results = await Promise.all(
    CHANNELS.map((c) => fetchChannelVideos(c.id, c.name))
  );

  const highlights = results
    .flat()
    .sort((a, b) => (b.published > a.published ? 1 : -1))
    .slice(0, 24);

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h1 className="font-bold text-[#0f172a] text-lg">하이라이트</h1>
            <p className="text-xs text-[#64748b] mt-0.5">5대리그 · UCL · K리그 공식 경기 영상</p>
          </div>

          {highlights.length === 0 ? (
            <div className="px-4 py-16 text-center text-[#64748b] text-sm">
              하이라이트를 불러오는 중입니다...
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map((h) => (
                <HighlightPlayer key={h.videoId} highlight={h} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
