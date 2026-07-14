"use client";

import { useState } from "react";

export default function LikeButton({
  postId,
  initialLikes,
  loggedIn,
}: {
  postId: string;
  initialLikes: number;
  loggedIn: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }
    if (liked || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setLiked(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading || liked}
      className={`flex items-center gap-2 px-6 py-2 border-2 rounded-full transition-colors text-sm font-medium
        ${liked
          ? "border-[#16a34a] bg-[#16a34a] text-white"
          : "border-[#16a34a] text-[#16a34a] hover:bg-[#16a34a] hover:text-white"
        } disabled:opacity-60`}
    >
      👍 좋아요 {likes}
    </button>
  );
}
