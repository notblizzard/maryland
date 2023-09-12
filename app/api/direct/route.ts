import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/prisma";
import upload from "@/upload";
import { PusherServer } from "@/pusher";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);

  if (session?.user?.email) {
    const email = session.user.email;

    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        directs: {
          include: {
            members: true,
            messages: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ user });
  }
}

export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);

  if (session?.user?.email) {
    const email = session.user.email;

    const user = await prisma.user.findFirst({
      where: { email },
    });

    const { username } = await request.json();

    const otherUser = await prisma.user.findFirst({
      where: { username },
    });
    if (user && otherUser) {
      const direct = await prisma.direct.findFirst({
        where: {
          AND: [
            {
              members: {
                some: {
                  id: user.id,
                },
              },
            },
            {
              members: {
                some: {
                  id: otherUser.id,
                },
              },
            },
          ],
        },
      });
      if (direct) {
        return NextResponse.json({ error: "You're already talking to them!" });
      } else {
        const direct = await prisma.direct.create({
          data: {
            members: {
              connect: [
                {
                  id: user.id,
                },
                {
                  id: otherUser.id,
                },
              ],
            },
          },
          include: {
            members: true,
            messages: {
              include: {
                user: true,
              },
            },
          },
        });
        direct.members.forEach((member) => {
          console.log(member);
          PusherServer.trigger(`direct-${member.id}`, "direct", direct);
        });

        return NextResponse.json({ direct });
      }
    }
  }
}
