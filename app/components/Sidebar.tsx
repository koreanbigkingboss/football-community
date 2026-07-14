import Link from "next/link";

const boards = [
  { slug: "free", name: "자유게시판", icon: "💬" },
  { slug: "kleague", name: "K리그", icon: "🇰🇷" },
  { slug: "epl", name: "EPL", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug: "laliga", name: "라리가", icon: "🇪🇸" },
  { slug: "bundesliga", name: "분데스리가", icon: "🇩🇪" },
  { slug: "seriea", name: "세리에A", icon: "🇮🇹" },
  { slug: "ucl", name: "챔피언스리그", icon: "⭐" },
  { slug: "transfer", name: "이적시장", icon: "🔄" },
  { slug: "highlight", name: "하이라이트", icon: "🎬" },
];

export default function Sidebar() {
  return (
    <aside className="w-48 shrink-0">
      <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden sticky top-16">
        <div className="px-3 py-2 bg-[#0f172a] text-white text-xs font-semibold tracking-wide">
          게시판
        </div>
        <nav className="py-1">
          {boards.map(({ slug, name, icon }) => (
            <Link
              key={slug}
              href={`/board/${slug}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#1e293b] hover:bg-[#f1f5f9] hover:text-[#16a34a] transition-colors"
            >
              <span className="text-base leading-none">{icon}</span>
              <span>{name}</span>
            </Link>
          ))}
        </nav>
        <div className="px-3 py-2 bg-[#0f172a] text-white text-xs font-semibold tracking-wide">
          기능
        </div>
        <nav className="py-1">
          <Link
            href="/betting"
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#1e293b] hover:bg-[#f1f5f9] hover:text-[#16a34a] transition-colors"
          >
            <span className="text-base leading-none">⚡</span>
            <span>포인트 배팅</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
