import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { zfd } from "zod-form-data";
import upload from "@/upload";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  if (session?.user?.email) {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });
    return NextResponse.json({ user });
  }
}

export async function POST(request: Request, response: Response) {
  const schema = zfd.formData({
    username: zfd.text(),
    description: zfd.text().optional(),
    avatar: zfd.text().optional(),
    displayname: zfd.text().optional(),
  });
  const res = schema.safeParse(await request.formData());
  if (res.success) {
    const session = await getServerSession(OPTIONS);
    const { username, description, avatar, displayname } = res.data;
    if (session?.user?.email) {
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
  } else {
    const { errors } = res.error;
    console.log(errors);
  }
}
