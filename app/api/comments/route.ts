import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { content, postId, parentId } = await req.json();
  if (!content?.trim() || !postId) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  const comment = await db.comment.create({
    data: {
      content: content.trim(),
      postId,
      authorId: session.user.id,
      parentId: parentId ?? null,
    },
    include: { author: { select: { name: true, image: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
