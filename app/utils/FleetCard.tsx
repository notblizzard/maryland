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
  image: string | File | null | undefined;
};

export default function FleetCard({
  data,
  key,
  dimension,
}: {
  data: Fleet;
  key: string;
  dimension?: number;
}) {
  const [fleet, setFleet] = useState<Fleet>(data);
  const [imageWidth, setImageWidth] = useState<number>(0);

  return (
    <div key={key} className="m-1 flex-none">
      <Dialog>
        <DialogTrigger>
          <Image
            src={`https://cdn.notblizzard.dev/maryland/uploads/${fleet.image}.png`}
            alt={fleet.id.toString()}
            width={100}
            height={100}
            className=" cursor-pointer rounded-xl"
          />
        </DialogTrigger>
        <DialogContent>
          <Image
            src={`https://cdn.notblizzard.dev/maryland/uploads/${fleet.image}.png`}
            alt={fleet.id.toString()}
            width={1000}
            height={1000}
            className=" cursor-pointer rounded-xl"
          />
          <div className="flex flex-row items-center">
            <div className="rainbow-border flex h-[50px] w-[50px] items-center justify-center rounded-full">
              <div className="bg-background flex h-[45px] w-[45px] items-center justify-center rounded-full">
                <Link href={`/dashboard/@${fleet.user.username}`}>
                  <Image
                    src={`https://cdn.notblizzard.dev/maryland/avatars/${fleet.user.avatar}.png`}
                    alt={fleet.user.username}
                    width={35}
                    height={35}
                    className="cursor-pointer rounded-full"
                  />
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
