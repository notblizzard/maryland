import prisma from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")!;
  const skip = parseInt(searchParams.get("skip")!);
  const user = await prisma.user.findFirst({
    where: { username },
    include: {
      _count: {
        select: { followers: true, following: true, posts: true },
      },
    },
  });
  if (user) {
    const posts = await prisma.post.findMany({
      where: {
        user: {
          id: user.id,
        },
      },
      include: {
        user: true,
        _count: {
          select: { hearts: true, comments: true },
        },
      },
      skip: skip * 10,
      take: 10,
    });
    if (posts) {
      if (posts.length <= 9) {
        return NextResponse.json({ user, posts, noMore: true });
      } else {
        return NextResponse.json({ user, posts });
      }
    }
  }
}
