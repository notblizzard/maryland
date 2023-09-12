import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { zfd } from "zod-form-data";
import upload from "@/upload";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);

  const { searchParams } = new URL(request.url);
  const skip = parseInt(searchParams.get("skip")!);
  if (session?.user?.email) {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        hearts: true,
        _count: {
          select: { hearts: true, comments: true },
        },
      },
      skip: skip * 10,
      take: 10,
    });

    if (posts.length <= 9) {
      return NextResponse.json({ posts, noMore: true });
    } else {
      return NextResponse.json({ posts });
    }
  }
}
