import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/prisma";
import upload from "@/upload";
import { PusherServer } from "@/pusher";
import { z } from "zod";

export async function POST(request: Request) {
  const session = await getServerSession(OPTIONS);

  const schema = z.object({
    message: z.string(),
    id: z.string(),
  });

  const response = schema.safeParse(await request.json());
  if (!response.success) {
    return NextResponse.json({ error: response.error });
  }
  const { message, id } = response.data;
  const email = session!.user!.email!;

  const user = await prisma.user.findFirst({
    where: { email },
  });
  if (user) {
    const direct = await prisma.direct.findFirst({
      where: {
        id: parseInt(id),
        members: {
          some: {
            id: user.id,
          },
        },
      },
      include: {
        members: true,
      },
    });
    if (direct) {
      const directMessage = await prisma.message.create({
        data: {
          message,
          direct: {
            connect: {
              id: direct.id,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        include: {
          direct: {
            select: {
              id: true,
            },
          },
          user: true,
        },
      });

      direct.members.forEach((member) => {
        PusherServer.trigger(`direct-${member.id}`, "message", directMessage);
      });
      return NextResponse.json({ ok: "ok" });
    }
  }
}
