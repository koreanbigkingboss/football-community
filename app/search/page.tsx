import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const results = query.length >= 2
    ? await db.post.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          author: { select: { name: true } },
          board: { select: { name: true, slug: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      })
    : [];

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <section className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h1 className="font-bold text-[#0f172a]">
              {query ? `"${query}" 검색 결과 (${results.length}건)` : "검색"}
            </h1>
          </div>

          {/* 검색창 */}
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <form method="GET" className="flex gap-2">
              <input
                name="q"
                defaultValue={query}
                placeholder="검색어를 입력하세요 (2자 이상)"
                className="flex-1 px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#16a34a] text-white text-sm rounded-lg hover:bg-[#15803d] transition-colors"
              >
                검색
              </button>
            </form>
          </div>

          {!query && (
            <p className="px-4 py-10 text-center text-sm text-[#64748b]">검색어를 입력해주세요.</p>
          )}
          {query && query.length < 2 && (
            <p className="px-4 py-10 text-center text-sm text-[#64748b]">검색어는 2자 이상 입력해주세요.</p>
          )}
          {query.length >= 2 && results.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-[#64748b]">
              &quot;{query}&quot;에 대한 검색 결과가 없습니다.
            </p>
          )}
          {results.length > 0 && (
            <ul className="divide-y divide-[#f1f5f9]">
              {results.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/post/${post.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors group"
                  >
                    <span className="text-xs text-white bg-[#0f172a] rounded px-1.5 py-0.5 shrink-0">
                      {post.board.name}
                    </span>
                    <span className="flex-1 text-sm text-[#1e293b] group-hover:text-[#16a34a] truncate">
                      {post.title}
                    </span>
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
      </div>
    </main>
  );
}
