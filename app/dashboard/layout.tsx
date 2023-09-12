"use client";

import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Settings from "./Settings";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
const inter = Inter({ subsets: ["latin"] });

type User = {
  id: number;
  username: string;
  email: string;
  description: string;
  displayname: string;
  avatar: string;
  _count: {
    posts: number;
    following: number;
    followers: number;
  };
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [post, setPost] = useState({
    image: "",
    description: "",
  });
  const pathname = usePathname();
  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  const handleNewPostSubmit = () => {
    const form = new FormData();
    if (post.image) form.append("image", post.image);
    form.append("description", post.description);
    fetch("/api/post", {
      method: "POST",
      body: form,
    });
  };

  const [user, setUser] = useState<User>(null!);
  return (
    <>
      {user && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-2 h-screen bg-slate-100">
            <div className="flex flex-col">
              <div className="flex flex-row  p-4">
                <Settings user={user} setUser={setUser} />
                <p className="text-lg font-bold">Maryland</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="rainbow-border flex h-[120px] w-[120px] items-center justify-center rounded-full">
                  <div className="flex h-[115px] w-[115px] items-center justify-center rounded-full bg-slate-100">
                    <Image
                      src={`https://cdn.notblizzard.dev/maryland/avatars/${user.avatar}.png`}
                      alt={user.username}
                      width={100}
                      height={100}
                      className=" cursor-pointer  rounded-full "
                    />
                  </div>
                </div>
                <p className="mt-4 text-xl font-bold">{user.displayname}</p>
                <p className="mt-1 text-sm  text-gray-400">@{user.username}</p>
                <div className="flex flex-row items-center justify-around gap-4">
                  <div className="mr-2 flex w-full flex-col items-center">
                    <p className="text-xl font-bold">{user._count.posts}</p>
                    <p className="text-xs text-gray-400">Posts</p>
                  </div>
                  <div className="flex w-full flex-col items-center">
                    <p className="text-xl font-bold">{user._count.followers}</p>
                    <p className="text-xs text-gray-400">Followers</p>
                  </div>
                  <div className="flex w-full flex-col items-center">
                    <p className="text-xl font-bold">{user._count.following}</p>
                    <p className="text-xs text-gray-400">Following</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/posts"
                  className={`${
                    pathname === "/dashboard/posts"
                      ? "text-rose-400"
                      : "text-slate-400"
                  }`}
                >
                  Posts
                </Link>
                <Link
                  href="/dashboard/explore"
                  className={`${
                    pathname === "/dashboard/explore"
                      ? "text-rose-400"
                      : "text-slate-400"
                  }`}
                >
                  Explore
                </Link>
                <Link
                  href="/dashboard/notifications"
                  className={`${
                    pathname === "/dashboard/notifications"
                      ? "text-rose-400"
                      : "text-slate-400"
                  }`}
                >
                  Notifications
                </Link>
              </div>
            </div>
          </div>
          <div className="col-span-10 h-screen w-full">
            <Dialog>
              <DialogTrigger className="focus-visible:ring-ring disabled:opacity-50w-1/6 text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-end items-center justify-end justify-center rounded-md bg-gradient-to-r from-pink-500 via-red-500  to-yellow-500 px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none">
                New Image
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Image</DialogTitle>
                  <DialogDescription className="flex flex-col justify-center">
                    Upload a new image to Maryland
                    <input
                      type="file"
                      name="image"
                      id="image"
                      className="hidden"
                      //value={post.image as string}
                      onChange={(e) => {
                        if (!e.target.files) return;
                        console.log(e.target.files);
                        setPost({
                          ...post,
                          image: e.target.files[0],
                        });
                      }}
                    />
                    <label htmlFor="image">
                      <Button
                        className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
                        onClick={() =>
                          document.getElementById("image")?.click()
                        }
                      >
                        Select Image
                      </Button>
                    </label>
                    <div className="flex w-full flex-col">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        name="description"
                        id="description"
                        value={post.description}
                        onChange={(e) =>
                          setPost({ ...post, description: e.target.value })
                        }
                        className="w-full text-black"
                        placeholder="Description"
                      />
                    </div>
                    <div>
                      <Button
                        onClick={handleNewPostSubmit}
                        className="mt-4 w-full bg-emerald-300 hover:bg-emerald-300/80"
                      >
                        Submit
                      </Button>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            {children}
          </div>
        </div>
      )}
    </>
  );
}