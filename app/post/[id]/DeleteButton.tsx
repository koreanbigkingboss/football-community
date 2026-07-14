"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ postId, boardSlug }: { postId: string; boardSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.push(`/board/${boardSlug}`);
      router.refresh();
    } else {
      alert("삭제에 실패했습니다.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-[#64748b] hover:text-red-500 transition-colors disabled:opacity-50"
    >
      {loading ? "삭제 중..." : "삭제"}
    </button>
  );
}
