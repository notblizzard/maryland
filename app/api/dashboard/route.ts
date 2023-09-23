import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);

  const { searchParams } = new URL(request.url);
  const skip = parseInt(searchParams.get("skip")!);

  const user = await prisma.user.findFirst({
    where: { email: session!.user!.email! },
    include: {
      _count: {
        select: { posts: true, followers: true, following: true },
      },
    },
  });
  const fleets = await prisma.fleet.findMany({
    where: {
      OR: [
        { user: { followers: { some: { followerId: user!.id } } } },
        { userId: user!.id },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });
  fleets.forEach((fleet) => {
    const now = dayjs(Date.now());
    const then = dayjs(fleet.createdAt);
    const diff = now.diff(then, "hour");
    if (diff > 24) {
      prisma.fleet.delete({
        where: { id: fleet.id },
      });
    }
  });
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { user: { followers: { some: { followerId: user!.id } } } },
        { userId: user!.id },
      ],
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
  type PostHeart = (typeof posts)[0] & { hearted: boolean };

  posts.map((post) => {
    (post as PostHeart).hearted = post.hearts.some(
      (heart) => heart.userId === user!.id,
    );
  });
  if (posts.length <= 9) {
    return NextResponse.json({ user, posts, fleets, noMore: true });
  } else {
    return NextResponse.json({ user, posts, fleets });
  }
}
