import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  const session = await getServerSession(OPTIONS);
  const skip = parseInt(searchParams.get("skip")!);

  const user = await prisma.user.findFirst({
    where: { email: session!.user!.email! },
  });

  const posts = await prisma.post.findMany({
    where: {
      hearts: {
        some: {
          userId: user!.id,
        },
      },
    },
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

export async function POST(request: Request) {
  const schema = z.object({
    id: z.number(),
  });

  const response = schema.safeParse(await request.json());
  if (!response.success) {
    return NextResponse.json({ error: response.error });
  }

  const { id } = response.data;
  const session = await getServerSession(OPTIONS);

  const post = await prisma.post.findFirst({
    where: { id },
    include: { user: true },
  });
  const user = await prisma.user.findFirst({
    where: { email: session!.user!.email! },
  });
  if (post && user) {
    const heart = await prisma.heart.findFirst({
      where: {
        user: {
          id: user.id,
        },
        post: {
          id: post.id,
        },
      },
    });
    if (heart) {
      await prisma.heart.delete({
        where: { id: heart.id },
      });
      await prisma.notification.deleteMany({
        where: {
          user: { id: post.user.id },
          post: { id: post.id },
          type: "HEART",
        },
      });
      return NextResponse.json({ hearted: false });
    } else {
      await prisma.heart.create({
        data: {
          user: { connect: { id: user.id } },
          post: { connect: { id: post.id } },
        },
      });
      await prisma.notification.create({
        data: {
          user: { connect: { id: post.user.id } },
          post: { connect: { id: post.id } },
          type: "HEART",
        },
      });

      return NextResponse.json({ hearted: true });
    }
  } else {
    return NextResponse.json({ error: true });
  }
}
