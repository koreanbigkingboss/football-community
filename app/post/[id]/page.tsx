import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";
import CommentSection from "./CommentSection";
import LikeButton from "./LikeButton";
import DeleteButton from "./DeleteButton";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      board: { select: { name: true, slug: true } },
      comments: {
        where: { parentId: null },
        include: {
          author: { select: { name: true } },
          replies: {
            include: { author: { select: { name: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) notFound();

  await db.post.update({ where: { id }, data: { views: { increment: 1 } } });

  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAuthor = !!userId && userId === post.authorId;

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <article className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden mb-4">
          {/* 게시판 경로 */}
          <div className="px-4 py-2 border-b border-[#e2e8f0] text-xs text-[#64748b]">
            <Link href="/" className="hover:text-[#16a34a]">홈</Link>
            {" › "}
            <Link href={`/board/${post.board.slug}`} className="hover:text-[#16a34a]">
              {post.board.name}
            </Link>
          </div>

          {/* 제목 + 메타 */}
          <div className="px-4 py-4 border-b border-[#e2e8f0]">
            <h1 className="text-xl font-bold text-[#0f172a] mb-2">{post.title}</h1>
            <div className="flex items-center gap-3 text-xs text-[#64748b]">
              <span className="font-medium text-[#1e293b]">{post.author.name}</span>
              <span>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
              <span>조회 {post.views.toLocaleString()}</span>
              <span>좋아요 {post.likes}</span>
              {isAuthor && (
                <div className="ml-auto flex items-center gap-2">
                  <Link
                    href={`/write?edit=${post.id}`}
                    className="text-[#64748b] hover:text-[#16a34a] transition-colors"
                  >
                    수정
                  </Link>
                  <span className="text-[#e2e8f0]">|</span>
                  <DeleteButton postId={post.id} boardSlug={post.board.slug} />
                </div>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="px-4 py-6 min-h-48 text-sm text-[#1e293b] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* 좋아요 */}
          <div className="px-4 py-4 border-t border-[#e2e8f0] flex justify-center">
            <LikeButton postId={post.id} initialLikes={post.likes} loggedIn={!!userId} />
          </div>
        </article>

        {/* 댓글 */}
        <CommentSection
          postId={post.id}
          comments={post.comments}
          currentUserId={userId}
        />
      </div>
    </main>
  );
}
