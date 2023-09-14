import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { z } from "zod";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")!;
  if (session?.user?.email) {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });
    const otherUser = await prisma.user.findFirst({
      where: { username },
    });
    if (user && otherUser) {
      const following = await prisma.follow.findFirst({
        where: {
          followerId: user.id,
          followingId: otherUser.id,
        },
      });
      return NextResponse.json({
        following: following === null ? false : true,
      });
    }
  }
}

export async function POST(request: Request) {
  const schema = z.object({
    id: z.string(),
  });

  const response = schema.safeParse(request.body);
  if (!response.success) {
    return NextResponse.json({ error: response.error });
  }

  const { id } = response.data;
  const session = await getServerSession(OPTIONS);
  if (session?.user?.email) {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });
    const otherUser = await prisma.user.findFirst({
      where: { id: parseInt(id) },
    });
    if (user && otherUser) {
      const follow = await prisma.follow.findFirst({
        where: {
          followerId: user.id,
          followingId: otherUser.id,
        },
      });
      if (follow) {
        await prisma.follow.delete({
          where: {
            id: follow.id,
          },
        });
        return NextResponse.json({
          following: false,
        });
      } else {
        await prisma.follow.create({
          data: {
            followerId: user.id,
            followingId: otherUser.id,
          },
        });
        return NextResponse.json({
          following: true,
        });
      }
    }
  }
}
