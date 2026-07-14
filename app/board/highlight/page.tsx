import Sidebar from "@/app/components/Sidebar";
import HighlightPlayer from "./HighlightPlayer";

type Highlight = {
  id: string;
  title: string;
  thumbnail: string;
  embed: string;
  competition: string;
  date: string;
  url: string;
};

async function fetchHighlights(): Promise<Highlight[]> {
  try {
    const res = await fetch("https://www.scorebat.com/video-api/v3/feed/", {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list: { id?: string; title?: string; thumbnail?: string; embed?: string; competition?: { name?: string }; date?: string; matchviewUrl?: string }[] =
      Array.isArray(data) ? data : data?.response ?? [];
    return list.slice(0, 20).map((item) => ({
      id: item.id ?? item.title ?? Math.random().toString(),
      title: item.title ?? "제목 없음",
      thumbnail: item.thumbnail ?? "",
      embed: item.embed ?? "",
      competition: item.competition?.name ?? "축구",
      date: item.date ? new Date(item.date).toLocaleDateString("ko-KR") : "",
      url: item.matchviewUrl ?? "",
    }));
  } catch {
    return [];
  }
}

export const revalidate = 1800;

export default async function HighlightPage() {
  const highlights = await fetchHighlights();

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h1 className="font-bold text-[#0f172a] text-lg">하이라이트</h1>
            <p className="text-xs text-[#64748b] mt-0.5">최근 축구 경기 하이라이트</p>
          </div>

          {highlights.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="text-[#64748b] text-sm">하이라이트를 불러오는 중입니다...</div>
              <div className="text-xs text-[#94a3b8] mt-2">ScoreBat API 연결 중</div>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map((h) => (
                <HighlightPlayer key={h.id} highlight={h} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
