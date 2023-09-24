import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import upload from "@/upload";
import { PusherServer } from "@/pusher";
import dayjs from "dayjs";
import { zfd } from "zod-form-data";

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
export async function POST(request: Request) {
  const schema = zfd.formData({
    image: zfd.file(),
  });

  const response = schema.safeParse(await request.formData());
  if (!response.success) {
    return NextResponse.json({ error: response.error });
  }

  const session = await getServerSession(OPTIONS);
  const { image } = response.data;
  const buffer = Buffer.from(await (image as Blob).arrayBuffer());
  const uuid = await upload(buffer, "uploads");
  const user = await prisma.user.findFirst({
    where: { email: session!.user!.email! },
  });
  if (!user) {
    return NextResponse.json({ error: true });
  }
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
  return NextResponse.json({ success: true });
}
