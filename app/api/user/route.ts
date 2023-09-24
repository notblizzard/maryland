import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import upload from "@/upload";
import { zfd } from "zod-form-data";
import { Prisma } from "@prisma/client";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  const email = session!.user!.email!;
  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      _count: {
        select: { posts: true, followers: true, following: true },
      },
    },
  });
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  const schema = zfd.formData({
    avatar: zfd.text().optional(),
    username: zfd.text(),
    description: zfd.text().optional(),
    displayname: zfd.text().optional(),
  });

  const response = schema.safeParse(await request.formData());
  if (!response.success) {
    return NextResponse.json({ error: response.error });
  }

  const { username, description, displayname } = response.data;

  const session = await getServerSession(OPTIONS);
  const email = session!.user!.email!;
  if (response.data.avatar) {
    const { avatar } = response.data;
    const buffer = Buffer.from(
      avatar.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );
    const uuid = await upload(buffer, "avatars");
    try {
      const user = await prisma.user.update({
        where: { email },
        data: { username, description, displayname, avatar: uuid },
        include: {
          _count: {
            select: { posts: true, followers: true, following: true },
          },
        },
      });
      return NextResponse.json({ user });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === "P2002") {
          return NextResponse.json({ error: "Username already exists" });
        } else {
          return NextResponse.json({ error: true });
        }
      }
      throw e;
    }
  } else {
    try {
      const user = await prisma.user.update({
        where: { email },
        data: { username, description, displayname },
        include: {
          _count: {
            select: { posts: true, followers: true, following: true },
          },
        },
      });
      return NextResponse.json({ user });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          return NextResponse.json({ error: "Username already exists" });
        } else {
          return NextResponse.json({ error: true });
        }
      }
      throw e;
    }
  }
}
