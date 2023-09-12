"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <p className="rainbow mb-10 text-9xl font-bold">Maryland</p>
      <Button
        onClick={() => signIn()}
        className="rounded-none transition-all ease-in-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(52,211,153,1)]"
      >
        Get Started!
      </Button>
    </main>
  );
}
