import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const BOARD_NAMES: Record<string, string> = {
  free: "자유게시판",
  kleague: "K리그",
  epl: "EPL",
  laliga: "라리가",
  bundesliga: "분데스리가",
  seriea: "세리에A",
  ucl: "챔피언스리그",
  transfer: "이적시장",
  highlight: "하이라이트",
};

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;

  // 전용 페이지가 있는 슬러그는 해당 페이지로
  if (slug === "transfer") redirect("/board/transfer");
  if (slug === "highlight") redirect("/board/highlight");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const PAGE_SIZE = 20;
  const boardName = BOARD_NAMES[slug] ?? slug;

  const [session, board] = await Promise.all([
    auth(),
    db.board.findUnique({ where: { slug } }),
  ]);
  const posts = board
    ? await db.post.findMany({
        where: { boardId: board.id },
        include: { author: { select: { name: true } }, _count: { select: { comments: true } } },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      })
    : [];
  const total = board ? await db.post.count({ where: { boardId: board.id } }) : 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <section className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          {/* 게시판 헤더 */}
          <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
            <h1 className="font-bold text-[#0f172a] text-lg">{boardName}</h1>
            {session?.user && (
              <Link
                href={`/write?board=${slug}`}
                className="px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm rounded transition-colors"
              >
                글쓰기
              </Link>
            )}
          </div>

          {/* 글 목록 */}
          {posts.length === 0 ? (
            <div className="px-4 py-16 text-center text-[#64748b] text-sm">
              아직 게시글이 없습니다. 첫 글을 작성해보세요!
            </div>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-[1fr_80px_60px_60px] px-4 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] text-xs text-[#64748b] font-medium">
                <span>제목</span>
                <span className="text-center">작성자</span>
                <span className="text-center">조회</span>
                <span className="text-center">댓글</span>
              </div>
              <ul className="divide-y divide-[#f1f5f9]">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/post/${post.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors group"
                    >
                      {post.isPinned && (
                        <span className="text-xs text-white bg-[#16a34a] rounded px-1.5 py-0.5 shrink-0">
                          공지
                        </span>
                      )}
                      <span className="flex-1 text-sm text-[#1e293b] group-hover:text-[#16a34a] truncate">
                        {post.title}
                      </span>
                      <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-[#64748b]">
                        <span className="w-20 text-center truncate">{post.author.name}</span>
                        <span className="w-15 text-center">{post.views.toLocaleString()}</span>
                        <span className="w-15 text-center text-[#16a34a]">
                          {post._count.comments}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* 페이지네이션 */}
              <div className="flex justify-center items-center gap-1 px-4 py-3 border-t border-[#e2e8f0]">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/board/${slug}?page=${p}`}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
                      p === page
                        ? "bg-[#16a34a] text-white font-medium"
                        : "text-[#64748b] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
