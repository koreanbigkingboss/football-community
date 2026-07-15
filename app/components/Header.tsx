"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-[#0f172a] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-6">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-[#16a34a] shrink-0">
          ⚽ 풋볼존
        </Link>

        {/* 상단 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {[
            { href: "/board/free", label: "자유게시판" },
            { href: "/board/kleague", label: "K리그" },
            { href: "/board/epl", label: "EPL" },
            { href: "/board/laliga", label: "라리가" },
            { href: "/board/bundesliga", label: "분데스리가" },
            { href: "/board/seriea", label: "세리에A" },
            { href: "/board/ligue1", label: "리그앙" },
            { href: "/board/ucl", label: "UCL" },
            { href: "/board/transfer", label: "이적시장" },
            { href: "/betting", label: "⚡배팅" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded text-sm text-slate-300 hover:text-white hover:bg-[#1e293b] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* 검색 */}
        <form method="GET" action="/search" className="hidden lg:flex items-center">
          <input
            name="q"
            placeholder="검색..."
            className="w-40 px-3 py-1.5 rounded-l bg-[#1e293b] text-white text-sm placeholder-slate-400 focus:outline-none focus:bg-[#334155]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] rounded-r text-white text-sm transition-colors"
          >
            🔍
          </button>
        </form>

        {/* 우측 인증 영역 */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {session ? (
            <>
              <Link href="/my" className="text-sm text-slate-300 hover:text-white hidden sm:block transition-colors">
                {session.user?.name}
              </Link>
              <Link
                href="/write"
                className="px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm rounded transition-colors"
              >
                글쓰기
              </Link>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm rounded transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
