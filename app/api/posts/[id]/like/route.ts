import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/posts/[id]/like">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const post = await db.post.update({
    where: { id },
    data: { likes: { increment: 1 } },
    select: { likes: true },
  });

  return NextResponse.json({ likes: post.likes });
}
