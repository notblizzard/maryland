"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import bg from "../public/colin-lloyd--uQK6Hrzu4k-unsplash.jpg";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Image
        src={bg}
        placeholder="blur"
        quality={100}
        fill
        sizes="100vw"
        alt="maryland bg"
        className="object-cover"
      />
      <div className="z-10 flex flex-col items-center justify-center">
        <p className="mb-10 text-9xl font-bold text-slate-100 drop-shadow">
          Maryland
        </p>
        <Button
          onClick={() => signIn()}
          className="rounded-none transition-all ease-in-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(52,211,153,1)]"
        >
          Get Started!
        </Button>
      </div>
    </main>
  );
}
