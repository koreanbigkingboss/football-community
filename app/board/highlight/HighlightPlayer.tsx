"use client";

import { useState } from "react";

type Highlight = {
  id: string;
  title: string;
  thumbnail: string;
  embed: string;
  competition: string;
  date: string;
  url: string;
};

export default function HighlightPlayer({ highlight }: { highlight: Highlight }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="rounded-lg border border-[#e2e8f0] overflow-hidden">
      <div className="relative bg-[#0f172a] aspect-video">
        {playing && highlight.embed ? (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: highlight.embed }}
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="w-full h-full flex items-center justify-center group relative"
          >
            {highlight.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={highlight.thumbnail}
                alt={highlight.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[#1e293b]" />
            )}
            <div className="relative z-10 w-14 h-14 rounded-full bg-black/60 group-hover:bg-[#16a34a]/80 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>
      <div className="px-3 py-2">
        <div className="text-xs text-[#64748b] mb-1">{highlight.competition} · {highlight.date}</div>
        <div className="text-sm font-medium text-[#1e293b] line-clamp-2">{highlight.title}</div>
      </div>
    </div>
  );
}
