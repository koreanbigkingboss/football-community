import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { title, content, boardSlug } = await req.json();
  if (!title?.trim() || !content?.trim() || !boardSlug) {
    return NextResponse.json({ error: "제목, 내용, 게시판을 모두 입력해주세요." }, { status: 400 });
  }

  const board = await db.board.findUnique({ where: { slug: boardSlug } });
  if (!board) {
    return NextResponse.json({ error: "존재하지 않는 게시판입니다." }, { status: 404 });
  }

  const post = await db.post.create({
    data: { title: title.trim(), content: content.trim(), boardId: board.id, authorId: session.user.id },
  });

  return NextResponse.json({ id: post.id }, { status: 201 });
}
