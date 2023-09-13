import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import upload from "@/upload";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  if (session?.user?.email) {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      include: {
        _count: {
          select: { posts: true, followers: true, following: true },
        },
      },
    });
    return NextResponse.json({ user });
  }
}

export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  const { username, description, avatar, displayname } = res.data;
  if (session?.user?.email) {
    const data = await request.formData();
    const avatar = data.get("avatar") as string;
    const username = data.get("username") as string;
    const description = data.get("description") as string;
    const displayname = data.get("displayname") as string;

    if (avatar) {
      const buffer = Buffer.from(
        avatar.replace(/^data:image\/\w+;base64,/, ""),
        "base64",
      );
      const uuid = await upload(buffer, "avatars");
      const user = await prisma.user.update({
        where: { email: session.user.email },
        data: { username, description, displayname, avatar: uuid },
      });
      return NextResponse.json(user);
    } else {
      const user = await prisma.user.update({
        where: { email: session.user.email },
        data: { username, description, displayname, avatar },
      });
      return NextResponse.json({ user });
    }
  }
}
