import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import upload from "@/upload";
import { zfd } from "zod-form-data";

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

export async function POST(request: Request) {
  const schema = zfd.formData({
    avatar: zfd.text().optional(),
    username: zfd.text(),
    description: zfd.text(),
    displayname: zfd.text(),
  });

  const response = schema.safeParse(request.body);
  if (!response.success) {
    return NextResponse.json({ error: response.error });
  }

  const { username, description, displayname } = response.data;

  const session = await getServerSession(OPTIONS);
  if (session?.user?.email) {
    if (response.data.avatar) {
      const { avatar } = response.data;
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
        data: { username, description, displayname },
      });
      return NextResponse.json({ user });
    }
  }
}
