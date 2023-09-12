import prisma from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("params")!;
  const skip = parseInt(searchParams.get("skip")!);
  const posts = await prisma.post.findMany({
    where: {
      description: {
        contains: search,
      },
    },
    skip: skip * 10,
    take: 10,
    include: {
      user: true,
      _count: {
        select: { hearts: true, comments: true },
      },
    },
  });
  if (posts.length <= 9) {
    return NextResponse.json({ posts, noMore: true });
  } else {
    return NextResponse.json({ posts });
  }
}
