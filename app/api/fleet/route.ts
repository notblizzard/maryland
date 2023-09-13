import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import upload from "@/upload";
import { PusherServer } from "@/pusher";
import dayjs from "dayjs";
export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id")!);
  const fleet = await prisma.fleet.findFirst({
    where: { id },
    include: {
      user: true,
    },
  });
  if (fleet) {
    const now = dayjs(Date.now());
    const then = dayjs(fleet.createdAt);
    const diff = now.diff(then, "hour");
    if (diff > 24) {
      await prisma.fleet.delete({
        where: { id: fleet.id },
      });
      return NextResponse.json({ error: true });
    } else {
      return NextResponse.json({ fleet });
    }
  } else {
    return NextResponse.json({ error: true });
  }
}
export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  if (session?.user?.email) {
    const data = await request.formData();
    const image = data.get("image");
    const buffer = Buffer.from(await (image as Blob).arrayBuffer());
    const uuid = await upload(buffer, "uploads");
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });
    if (user) {
      const fleet = await prisma.fleet.create({
        data: {
          image: uuid,
          user: { connect: { id: user.id } },
        },
        include: {
          user: true,
        },
      });
      PusherServer.trigger(`maryland-${user.id}`, "new-fleet", fleet);
    }
  }
}