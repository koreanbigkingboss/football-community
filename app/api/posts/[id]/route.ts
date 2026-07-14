import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/posts/[id]">
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const post = await db.post.findUnique({ where: { id }, select: { authorId: true } });

  if (!post) return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });

  const userId = (session.user as { id?: string }).id;
  if (post.authorId !== userId) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  await db.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
