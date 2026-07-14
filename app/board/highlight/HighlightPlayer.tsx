"use client";

import { useState } from "react";

type VideoItem = {
  videoId: string;
  title: string;
  thumbnail: string;
  published: string;
  channel: string;
};

export default function HighlightPlayer({ highlight }: { highlight: VideoItem }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="rounded-lg border border-[#e2e8f0] overflow-hidden bg-white">
      <div className="relative bg-[#0f172a] aspect-video">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${highlight.videoId}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="w-full h-full flex items-center justify-center group relative"
          >
            {/* 썸네일 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={highlight.thumbnail}
              alt={highlight.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            {/* 재생 버튼 */}
            <div className="relative z-10 w-14 h-14 rounded-full bg-black/60 group-hover:bg-red-600 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>
      <div className="px-3 py-2">
        <div className="text-xs text-[#64748b] mb-1">
          {highlight.channel} · {highlight.published}
        </div>
        <div className="text-sm font-medium text-[#1e293b] line-clamp-2 leading-snug">
          {highlight.title}
        </div>
      </div>
    </div>
  );
}
