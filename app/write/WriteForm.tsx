"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BOARDS = [
  { slug: "free", name: "자유게시판" },
  { slug: "kleague", name: "K리그" },
  { slug: "epl", name: "EPL" },
  { slug: "laliga", name: "라리가" },
  { slug: "bundesliga", name: "분데스리가" },
  { slug: "seriea", name: "세리에A" },
  { slug: "ucl", name: "챔피언스리그" },
  { slug: "ligue1", name: "리그앙" },
];

const LEAGUE_TEAMS: Record<string, string[]> = {
  kleague: ["전북", "울산", "서울", "수원", "포항", "인천", "광주", "제주", "대전", "강원", "대구", "수원FC"],
  epl: ["아스날", "첼시", "리버풀", "맨시티", "맨유", "토트넘", "뉴캐슬", "아스톤빌라", "웨스트햄", "에버턴", "브라이튼", "풀럼"],
  laliga: ["레알마드리드", "바르셀로나", "아틀레티코", "세비야", "발렌시아", "레알베티스", "빌바오", "소시에다드"],
  bundesliga: ["바이에른", "도르트문트", "라이프치히", "레버쿠젠", "프랑크푸르트", "볼프스부르크", "샬케", "마인츠"],
  seriea: ["유벤투스", "AC밀란", "인테르", "나폴리", "로마", "라치오", "피오렌티나", "아탈란타", "토리노"],
  ligue1: ["PSG", "모나코", "마르세유", "리옹", "릴", "니스", "렌", "스트라스부르", "낭트"],
};

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const [boardSlug, setBoardSlug] = useState(params.get("board") || "free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const teams = LEAGUE_TEAMS[boardSlug] ?? [];

  function handleBoardChange(slug: string) {
    setBoardSlug(slug);
    setTeamTag("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, boardSlug, teamTag: teamTag || undefined }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "오류가 발생했습니다.");
      return;
    }

    router.push(`/post/${data.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h1 className="font-bold text-[#0f172a]">글쓰기</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">게시판</label>
              <select
                value={boardSlug}
                onChange={(e) => handleBoardChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a]"
              >
                {BOARDS.map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </div>

            {teams.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">팀 태그 <span className="text-xs text-[#94a3b8]">(선택)</span></label>
                <select
                  value={teamTag}
                  onChange={(e) => setTeamTag(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a]"
                >
                  <option value="">팀 선택 안함</option>
                  {teams.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1e293b] mb-1">제목</label>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1e293b] mb-1">내용</label>
            <textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={16}
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] resize-y"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-[#e2e8f0] text-[#64748b] rounded-lg text-sm hover:bg-[#f8fafc] transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WriteForm() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
