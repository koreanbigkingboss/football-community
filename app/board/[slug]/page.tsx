import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const BOARD_NAMES: Record<string, string> = {
  free: "자유게시판",
  kleague: "K리그",
  epl: "EPL",
  laliga: "라리가",
  bundesliga: "분데스리가",
  seriea: "세리에A",
  ucl: "챔피언스리그",
  ligue1: "리그앙",
  transfer: "이적시장",
  highlight: "하이라이트",
};

const LEAGUE_TEAMS: Record<string, string[]> = {
  kleague: ["전북", "울산", "서울", "수원", "포항", "인천", "광주", "제주", "대전", "강원", "대구", "수원FC"],
  epl: ["아스날", "첼시", "리버풀", "맨시티", "맨유", "토트넘", "뉴캐슬", "아스톤빌라", "웨스트햄", "에버턴", "브라이튼", "풀럼"],
  laliga: ["레알마드리드", "바르셀로나", "아틀레티코", "세비야", "발렌시아", "레알베티스", "빌바오", "소시에다드"],
  bundesliga: ["바이에른", "도르트문트", "라이프치히", "레버쿠젠", "프랑크푸르트", "볼프스부르크", "샬케", "마인츠"],
  seriea: ["유벤투스", "AC밀란", "인테르", "나폴리", "로마", "라치오", "피오렌티나", "아탈란타", "토리노"],
  ligue1: ["PSG", "모나코", "마르세유", "리옹", "릴", "니스", "렌", "스트라스부르", "낭트"],
  ucl: [],
  free: [],
};

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; team?: string }>;
}) {
  const { slug } = await params;

  if (slug === "transfer") redirect("/board/transfer");
  if (slug === "highlight") redirect("/board/highlight");

  const { page: pageParam, team: selectedTeam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const PAGE_SIZE = 20;
  const boardName = BOARD_NAMES[slug] ?? slug;
  const teams = LEAGUE_TEAMS[slug] ?? [];

  const [session, board] = await Promise.all([
    auth(),
    db.board.findUnique({ where: { slug } }),
  ]);

  const where = board
    ? {
        boardId: board.id,
        ...(selectedTeam ? { teamTag: selectedTeam } : {}),
      }
    : {};

  const [posts, total] = board
    ? await Promise.all([
        db.post.findMany({
          where,
          include: { author: { select: { name: true } }, _count: { select: { comments: true } } },
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
        db.post.count({ where }),
      ])
    : [[], 0];

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

          {/* 팀 탭 */}
          {teams.length > 0 && (
            <div className="px-3 py-2 border-b border-[#e2e8f0] overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                <Link
                  href={`/board/${slug}`}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                    !selectedTeam
                      ? "bg-[#16a34a] text-white"
                      : "text-[#475569] hover:bg-[#f1f5f9]"
                  }`}
                >
                  전체
                </Link>
                {teams.map((team) => (
                  <Link
                    key={team}
                    href={`/board/${slug}?team=${encodeURIComponent(team)}`}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedTeam === team
                        ? "bg-[#16a34a] text-white"
                        : "text-[#475569] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    {team}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 글 목록 */}
          {posts.length === 0 ? (
            <div className="px-4 py-16 text-center text-[#64748b] text-sm">
              {selectedTeam
                ? `${selectedTeam} 관련 게시글이 없습니다.`
                : "아직 게시글이 없습니다. 첫 글을 작성해보세요!"}
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
                      {"teamTag" in post && post.teamTag && (
                        <span className="text-xs text-[#16a34a] bg-[#dcfce7] rounded px-1.5 py-0.5 shrink-0">
                          {post.teamTag}
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
                    href={`/board/${slug}?${selectedTeam ? `team=${encodeURIComponent(selectedTeam)}&` : ""}page=${p}`}
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
