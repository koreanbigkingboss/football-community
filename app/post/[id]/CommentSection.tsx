"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Reply = {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string };
};

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string };
  replies: Reply[];
};

export default function CommentSection({
  postId,
  comments: initialComments,
  currentUserId,
}: {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitComment(content: string, parentId?: string) {
    if (!content.trim()) return;
    setLoading(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, postId, parentId }),
    });

    setLoading(false);
    if (!res.ok) return;

    router.refresh();
    setText("");
    setReplyText("");
    setReplyTo(null);
  }

  return (
    <section className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e2e8f0]">
        <h2 className="font-semibold text-[#0f172a]">댓글 {comments.length}</h2>
      </div>

      {/* 댓글 목록 */}
      <ul className="divide-y divide-[#f1f5f9]">
        {comments.map((c) => (
          <li key={c.id} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-[#1e293b]">{c.author.name}</span>
              <span className="text-xs text-[#64748b]">
                {new Date(c.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
            <p className="text-sm text-[#1e293b] whitespace-pre-wrap mb-1">{c.content}</p>
            {currentUserId && (
              <button
                onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                className="text-xs text-[#64748b] hover:text-[#16a34a]"
              >
                답글
              </button>
            )}

            {/* 대댓글 */}
            {c.replies.length > 0 && (
              <ul className="mt-2 pl-4 border-l-2 border-[#e2e8f0] space-y-2">
                {c.replies.map((r) => (
                  <li key={r.id}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-[#1e293b]">{r.author.name}</span>
                      <span className="text-xs text-[#64748b]">
                        {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="text-sm text-[#1e293b] whitespace-pre-wrap">{r.content}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* 답글 입력 */}
            {replyTo === c.id && (
              <div className="mt-2 pl-4 border-l-2 border-[#16a34a]">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                  placeholder="답글을 입력하세요"
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a] resize-none"
                />
                <div className="flex gap-2 mt-1 justify-end">
                  <button
                    onClick={() => setReplyTo(null)}
                    className="px-3 py-1 text-xs text-[#64748b] border border-[#e2e8f0] rounded"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => submitComment(replyText, c.id)}
                    disabled={loading}
                    className="px-3 py-1 text-xs bg-[#16a34a] text-white rounded disabled:opacity-60"
                  >
                    등록
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* 댓글 작성 */}
      {currentUserId ? (
        <div className="px-4 py-3 border-t border-[#e2e8f0]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="댓글을 입력하세요"
            className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => submitComment(text)}
              disabled={loading || !text.trim()}
              className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white text-sm rounded-lg transition-colors"
            >
              {loading ? "등록 중..." : "댓글 등록"}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-[#e2e8f0] text-center text-sm text-[#64748b]">
          댓글을 작성하려면{" "}
          <a href="/login" className="text-[#16a34a] hover:underline">
            로그인
          </a>
          이 필요합니다.
        </div>
      )}
    </section>
  );
}
