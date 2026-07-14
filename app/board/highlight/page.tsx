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

const CHANNELS = [
  { id: "UCqZQlzSHbVJrwrn5XvzrzcA", name: "Premier League" },
  { id: "UCwc7FMSzr8e-Vo72V8Rp63A", name: "UEFA" },
  { id: "UCTFNGq5eMKRKN0i7h1vPSMw", name: "La Liga" },
  { id: "UCGSbmA1eLbBjz_cKlFfJBqg", name: "Bundesliga" },
  { id: "UCKSFuSRoHfGnMGTRjPZK9BA", name: "Champions League" },
];

async function fetchChannelVideos(channelId: string, channelName: string): Promise<VideoItem[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    const text = await res.text();

    const entries = text.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];
    return entries.slice(0, 4).flatMap((entry) => {
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

      return [{
        videoId,
        title,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        published: published ? new Date(published).toLocaleDateString("ko-KR") : "",
        channel: channelName,
      }];
    });
  } catch {
    return [];
  }
}

export default async function HighlightPage() {
  const results = await Promise.all(
    CHANNELS.map((c) => fetchChannelVideos(c.id, c.name))
  );
  const highlights = results.flat().slice(0, 20);

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h1 className="font-bold text-[#0f172a] text-lg">하이라이트</h1>
            <p className="text-xs text-[#64748b] mt-0.5">YouTube 공식 채널 최신 영상</p>
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
