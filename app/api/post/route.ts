import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import upload from "@/upload";
import { PusherServer } from "@/pusher";

export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id")!);
  const post = await prisma.post.findFirst({
    where: { id },
    include: {
      user: true,
      comments: true,
      _count: {
        select: { hearts: true, comments: true },
      },
    },
  });
  if (post) {
    return NextResponse.json({ post });
  }
}
export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  if (session?.user?.email) {
    const data = await request.formData();
    const image = data.get("image");
    const description = data.get("description") as string;
    const buffer = Buffer.from(await (image as Blob).arrayBuffer());
    const uuid = await upload(buffer, "uploads");
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });
    if (user) {
      const post = await prisma.post.create({
        data: {
          description,
          image: uuid,
          user: { connect: { id: user.id } },
        },
      });
      PusherServer.trigger(`maryland-${user.id}`, "new-post", post);
    }
  }
}
