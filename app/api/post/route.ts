import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import upload from "@/upload";
import { PusherServer } from "@/pusher";
import { zfd } from "zod-form-data";

export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id")!);
  const post = await prisma.post.findFirst({
    where: { id },
    include: {
      user: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
        },
      },
      _count: {
        select: { hearts: true, comments: true },
      },
    },
  });
  if (post) {
    return NextResponse.json({ post });
  } else {
    return NextResponse.json({ error: true });
  }
}
export async function POST(request: Request) {
  const schema = zfd.formData({
    image: zfd.file(),
    description: zfd.text().optional(),
  });

  const response = schema.safeParse(await request.formData());
  if (!response.success) {
    return NextResponse.json({ error: response.error });
  }

  const { image, description } = response.data;

  const session = await getServerSession(OPTIONS);
  const buffer = Buffer.from(await (image as Blob).arrayBuffer());
  const uuid = await upload(buffer, "uploads");
  const user = await prisma.user.findFirst({
    where: { email: session!.user!.email! },
    include: {
      followers: true,
    },
  });
  if (user) {
    const post = await prisma.post.create({
      data: {
        description: description || "",
        image: uuid,
        user: { connect: { id: user.id } },
      },
      include: {
        user: true,
        _count: {
          select: { hearts: true, comments: true },
        },
      },
    });
    PusherServer.trigger(`feed-${user.id}`, "post", post);
    return NextResponse.json({ sucess: true });
  } else {
    return NextResponse.json({ error: true });
  }
}
