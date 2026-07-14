import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const BOARD_LABEL: Record<string, string> = {
  free: "자유", kleague: "K리그", epl: "EPL", laliga: "라리가",
  bundesliga: "분데스", seriea: "세리에A", ucl: "UCL", transfer: "이적", highlight: "하이라이트",
};

export const revalidate = 60;

export default async function HomePage() {
  const [recentPosts, hotPosts, noticePosts] = await Promise.all([
    db.post.findMany({
      where: { isPinned: false },
      include: { author: { select: { name: true } }, board: { select: { slug: true } }, _count: { select: { comments: true } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    db.post.findMany({
      where: { isPinned: false },
      include: { board: { select: { slug: true } } },
      orderBy: { views: "desc" },
      take: 5,
    }),
    db.post.findMany({
      where: { isPinned: true },
      include: { board: { select: { slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* 최신 게시글 */}
        <section className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="font-semibold text-[#0f172a]">최신 게시글</h2>
            <Link href="/board/free" className="text-xs text-[#16a34a] hover:underline">더보기</Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#64748b]">아직 게시글이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-[#f1f5f9]">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link href={`/post/${post.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors group">
                    <span className="text-xs text-white bg-[#0f172a] rounded px-1.5 py-0.5 shrink-0">
                      {BOARD_LABEL[post.board.slug] ?? post.board.slug}
                    </span>
                    <span className="flex-1 text-sm text-[#1e293b] group-hover:text-[#16a34a] truncate">{post.title}</span>
                    <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs text-[#64748b]">
                      <span>{post.author.name}</span>
                      <span>조회 {post.views.toLocaleString()}</span>
                      <span className="text-[#16a34a]">댓글 {post._count.comments}</span>
                      <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 공지사항 */}
          <section className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e2e8f0]">
              <h2 className="font-semibold text-[#0f172a]">공지사항</h2>
            </div>
            {noticePosts.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[#64748b]">공지사항이 없습니다.</p>
            ) : (
              <ul className="divide-y divide-[#f1f5f9]">
                {noticePosts.map((post) => (
                  <li key={post.id}>
                    <Link href={`/post/${post.id}`} className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#f8fafc] transition-colors">
                      <span className="text-xs text-white bg-[#16a34a] rounded px-1.5 py-0.5 shrink-0">공지</span>
                      <span className="text-sm text-[#1e293b] truncate">{post.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 인기글 */}
          <section className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e2e8f0]">
              <h2 className="font-semibold text-[#0f172a]">🔥 인기글</h2>
            </div>
            {hotPosts.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[#64748b]">아직 인기글이 없습니다.</p>
            ) : (
              <ul className="divide-y divide-[#f1f5f9]">
                {hotPosts.map((post, i) => (
                  <li key={post.id}>
                    <Link href={`/post/${post.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8fafc] transition-colors group">
                      <span className={`text-sm font-bold w-4 shrink-0 ${
                        i === 0 ? "text-[#dc2626]" : i === 1 ? "text-[#ea580c]" : i === 2 ? "text-[#ca8a04]" : "text-[#64748b]"
                      }`}>{i + 1}</span>
                      <span className="flex-1 text-sm text-[#1e293b] group-hover:text-[#16a34a] truncate">{post.title}</span>
                      <span className="text-xs text-[#64748b] shrink-0">{post.views.toLocaleString()}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
