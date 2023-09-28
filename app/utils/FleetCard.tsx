import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegCommentAlt } from "react-icons/fa";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

type Fleet = {
  id: number;
  user: User;
  image: string;
};

export default function FleetCard({ data, key }: { data: Fleet; key: string }) {
  const fleet = data;

  return (
    <div key={key} className="m-1 flex-none">
      <Dialog>
        <DialogTrigger>
          <Image
            src={fleet.image}
            alt={fleet.id.toString()}
            width={100}
            height={100}
            className=" cursor-pointer rounded-xl"
          />
        </DialogTrigger>
        <DialogContent>
          <Image
            src={fleet.image}
            alt={fleet.id.toString()}
            width={1000}
            height={1000}
            className=" cursor-pointer rounded-xl"
          />
          <div className="flex flex-row items-center">
            <div className="rainbow-border flex h-[50px] w-[50px] items-center justify-center rounded-full">
              <div className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-background">
                <Link href={`/dashboard/@${fleet.user.username}`}>
                  <Avatar className="h-[35px] w-[35px]">
                    <AvatarImage
                      src={fleet.user.avatar}
                      alt={fleet.user.username}
                    />
                    <AvatarFallback></AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </div>
            <Link href={`/dashboard/@${fleet.user.username}`}>
              <p className="font-bold text-black">{fleet.user.username}</p>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
