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
        </DialogContent>
      </Dialog>
    </div>
  );
}
