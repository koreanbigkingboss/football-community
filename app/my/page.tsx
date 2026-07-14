import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect("/login");

  const [user, myPosts, myComments, myPredictions] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, level: true, points: true, createdAt: true },
    }),
    db.post.findMany({
      where: { authorId: userId },
      include: { board: { select: { name: true, slug: true } }, _count: { select: { comments: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.comment.findMany({
      where: { authorId: userId },
      include: { post: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.prediction.findMany({
      where: { userId },
      include: {
        match: { select: { homeTeam: true, awayTeam: true, homeScore: true, awayScore: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  if (!user) redirect("/login");

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
      {/* 프로필 카드 */}
      <section className="bg-white rounded-lg border border-[#e2e8f0] p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#0f172a] flex items-center justify-center text-2xl text-white font-bold shrink-0">
            {user.name[0]}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-[#0f172a]">{user.name}</p>
            <p className="text-sm text-[#64748b]">{user.email}</p>
            <div className="flex gap-3 mt-1 text-xs text-[#64748b]">
              <span>Lv.{user.level}</span>
              <span>포인트 {user.points.toLocaleString()}</span>
              <span>가입일 {new Date(user.createdAt).toLocaleDateString("ko-KR")}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 px-3 py-1 bg-[#16a34a] rounded-full text-xs text-white font-medium mb-1">
              Lv.{user.level}
            </div>
            <Link href="/betting" className="text-xs text-[#16a34a] hover:underline">
              배팅하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* 배팅 이력 */}
      {myPredictions.length > 0 && (
        <section className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="font-semibold text-[#0f172a]">최근 배팅 ({myPredictions.length})</h2>
            <Link href="/betting" className="text-xs text-[#16a34a] hover:underline">전체보기</Link>
          </div>
          <ul className="divide-y divide-[#f1f5f9]">
            {myPredictions.map((p) => {
              const statusLabel: Record<string, string> = { PENDING: "진행중", WON: "적중", PARTIAL: "일부적중", LOST: "낙첨" };
              const statusColor: Record<string, string> = { PENDING: "text-[#64748b]", WON: "text-[#16a34a] font-medium", PARTIAL: "text-blue-600 font-medium", LOST: "text-red-500" };
              return (
                <li key={p.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-[#1e293b]">{p.match.homeTeam} vs {p.match.awayTeam}</div>
                    <div className="text-xs text-[#64748b]">
                      {p.predictWinner === "home" ? p.match.homeTeam : p.predictWinner === "away" ? p.match.awayTeam : "무승부"} 예측
                      {p.predictHomeScore != null && ` (${p.predictHomeScore}:${p.predictAwayScore})`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={statusColor[p.status]}>{statusLabel[p.status]}</div>
                    <div className="text-xs text-[#64748b]">
                      -{p.pointsBet.toLocaleString()}P
                      {p.pointsResult != null && p.pointsResult > 0 && <span className="text-[#16a34a]"> +{p.pointsResult.toLocaleString()}P</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 내 게시글 */}
      <section className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 className="font-semibold text-[#0f172a]">내 게시글 ({myPosts.length})</h2>
        </div>
        {myPosts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#64748b]">작성한 게시글이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-[#f1f5f9]">
            {myPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/post/${post.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors group">
                  <span className="text-xs text-white bg-[#0f172a] rounded px-1.5 py-0.5 shrink-0">
                    {post.board.name}
                  </span>
                  <span className="flex-1 text-sm text-[#1e293b] group-hover:text-[#16a34a] truncate">
                    {post.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#64748b] shrink-0">
                    <span>조회 {post.views}</span>
                    <span className="text-[#16a34a]">댓글 {post._count.comments}</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 내 댓글 */}
      <section className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h2 className="font-semibold text-[#0f172a]">내 댓글 ({myComments.length})</h2>
        </div>
        {myComments.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#64748b]">작성한 댓글이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-[#f1f5f9]">
            {myComments.map((c) => (
              <li key={c.id}>
                <Link href={`/post/${c.post.id}`} className="flex flex-col gap-1 px-4 py-3 hover:bg-[#f8fafc] transition-colors group">
                  <p className="text-xs text-[#16a34a] truncate">{c.post.title}</p>
                  <p className="text-sm text-[#1e293b] truncate">{c.content}</p>
                  <p className="text-xs text-[#64748b]">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: ko })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
