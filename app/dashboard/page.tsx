"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import PusherClient from "pusher-js";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { AiOutlineHeart } from "react-icons/ai";
import { FaRegCommentAlt } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signOut } from "next-auth/react";
import Settings from "./Settings";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type User = {
  id: number;
  username: string;
  email: string;
  description: string;
  displayname: string;
  avatar: string;
};

type Post = {
  id: number;
  image: string | File | null | undefined;
  description: string;
  createdAt: Date;
  _count: {
    comments: number;
    hearts: number;
  };
};

type Comment = {
  user: User;
  post: Post;
  createdAt: Date;
  text: string;
};

type Heart = {
  user: User;
  post: Post;
  createdAt: Date;
};

export default function Dashboard() {
  const [user, setUser] = useState<User>(null!);
  const [posts, setPosts] = useState<Post[]>([]);
  const [post, setPost] = useState({
    image: "",
    description: "",
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        console.log(data.posts);
        setPosts(data.posts);
      });
  }, []);

  useEffect(() => {
    if (user && user.id) {
      const pusher = new PusherClient("ec8aeca561a2f2b96138", {
        cluster: "us2",
      });
      const channel = pusher.subscribe(`maryland-${user.id}`);
      channel.bind("new-post", (post: Post) => {
        console.log(post);
        setPosts([post].concat(posts));
      });

      return () => {
        pusher.unsubscribe(`maryland-${user.id}`);
      };
    }
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

  return (
    <>
      {user && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-2 h-screen bg-slate-100">
            <div className="flex flex-col ">
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
              </div>
            </div>
          </div>

          <div className="col-span-10 h-screen w-full">
            <div className="grid h-screen grid-rows-6 gap-4">
              <div className="row-span-1"></div>
              <div className="row-span-5">
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
                <p className="mb-4 p-4 text-4xl font-bold">Feed</p>
                <ResponsiveMasonry
                  columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                >
                  <Masonry gutter={"1rem"} className="pr-4">
                    {posts.map((post) => (
                      <div key={post.id.toString()}>
                        <Image
                          src={`https://cdn.notblizzard.dev/maryland/uploads/${post.image}.png`}
                          alt={post.description}
                          width={500}
                          height={500}
                          className="mb-3 h-auto max-w-full cursor-pointer rounded-xl"
                        />
                        <div className="mb-5 flex flex-row justify-between">
                          <div className="flex flex-row items-center">
                            <div className="rainbow-border flex h-[50px] w-[50px] items-center justify-center rounded-full">
                              <div className="bg-background flex h-[45px] w-[45px] items-center justify-center rounded-full">
                                <Image
                                  src={`https://cdn.notblizzard.dev/maryland/avatars/${user.avatar}.png`}
                                  alt={user.username}
                                  width={35}
                                  height={35}
                                  className="cursor-pointer rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row items-center">
                            <AiOutlineHeart className="mx-1 h-5 w-5" />
                            <p className="text-lg font-bold">
                              {post._count.comments}
                            </p>
                            <FaRegCommentAlt className="ml-4 mr-1 h-5 w-5" />
                            <p className="text-lg font-bold">
                              {post._count.hearts}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
