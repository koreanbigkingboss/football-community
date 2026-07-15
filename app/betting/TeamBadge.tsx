"use client";

export default function TeamBadge({ src, name }: { src?: string | null; name: string }) {
  const initial = name.charAt(0).toUpperCase();

  if (!src) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#e2e8f0] flex items-center justify-center text-[#475569] text-xs font-bold shrink-0">
        {initial}
      </div>
    );
  }

  return (
    <div className="relative w-8 h-8 shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="w-8 h-8 object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = "flex";
        }}
      />
      <div
        className="hidden absolute inset-0 rounded-full bg-[#e2e8f0] items-center justify-center text-[#475569] text-xs font-bold"
      >
        {initial}
      </div>
    </div>
  );
}
