import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import prisma from "@/prisma";

export async function POST(request: NextRequest) {
  const schema = z.object({
    id: z.number(),
    text: z.string(),
  });
  const response = schema.safeParse(await request.json());
  if (!response.success) {
    return NextResponse.json({ error: true });
  }
  const { id, text } = response.data;
  const session = await getServerSession(OPTIONS);
  const user = await prisma.user.findFirst({
    where: { email: session!.user!.email! },
  });
  const comment = await prisma.comment.create({
    data: {
      text,
      user: { connect: { id: user!.id } },
      post: { connect: { id } },
    },
    include: {
      user: true,
    },
  });
  return NextResponse.json({ comment });
}
