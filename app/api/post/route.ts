import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { zfd } from "zod-form-data";
import upload from "@/upload";
import { PusherServer } from "@/pusher";

export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  console.log("a");
  if (session?.user?.email) {
    const schema = zfd.formData({
      description: zfd.text().optional(),
      image: zfd.file(),
    });
    const res = schema.safeParse(await request.formData());
    console.log("b");
    if (res.success) {
      const { description, image } = res.data;
      const buffer = Buffer.from(await image.arrayBuffer());
      const uuid = await upload(buffer, "uploads");
      const user = await prisma.user.findFirst({
        where: { email: session.user.email },
      });
      console.log("c");
      if (user) {
        const post = await prisma.post.create({
          data: {
            description,
            image: uuid,
            user: { connect: { id: user.id } },
          },
        });
        console.log("d");
        PusherServer.trigger(`maryland-${user.id}`, "new-post", post);
        console.log("e");
      }
    } else {
      const { errors } = res.error;
      console.log(errors);
    }
  }
}
