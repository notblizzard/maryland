import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { zfd } from "zod-form-data";
import upload from "@/upload";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);

  if (session?.user?.email) {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      include: {
        _count: {
          select: { posts: true, followers: true, following: true },
        },
      },
    });
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { hearts: true, comments: true },
        },
      },
    }); // TODO: filter by user
    return NextResponse.json({ user, posts });
  }
}
