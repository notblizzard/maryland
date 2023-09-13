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
import { useState, useEffect, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import PusherClient from "pusher-js";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegCommentAlt } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";

import { signOut } from "next-auth/react";
import Settings from "../Settings";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PostCard from "@/app/utils/PostCard";
import FleetCard from "@/app/utils/FleetCard";

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

type Post = {
  id: number;
  user: User;
  image: string | File | null | undefined;
  description: string;
  createdAt: Date;
  _count: {
    comments: number;
    hearts: number;
  };
  hearted: boolean;
};

type Fleet = {
  id: number;
  user: User;
  image: string;
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
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [post, setPost] = useState({
    image: "",
    description: "",
  });

  const getData = useCallback(() => {
    fetch(`/api/dashboard?skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setPosts(posts.concat(data.posts));
        setFleets(data.fleets);
        setSkip(skip + 1);
        if (data.noMore) setHasMore(false);
      });
  }, [skip]);

  useEffect(() => {
    getData();
    if (user && user.id) {
      const pusher = new PusherClient("ec8aeca561a2f2b96138", {
        cluster: "us2",
      });
      const channel = pusher.subscribe(`maryland-${user.id}`);
      channel.bind("new-post", (post: Post) => {
        setPosts([post].concat(posts));
      });

      channel.bind("new-fleet", (fleet: Fleet) => {
        setFleets([fleet].concat(fleets));
      });

      return () => {
        pusher.unsubscribe(`maryland-${user.id}`);
      };
    }
  }, []);

  return (
    <>
      {user && (
        <div className="grid h-screen grid-rows-6 gap-4">
          <div className="row-span-1">
            <p className="mb-1  text-4xl font-bold">Fleets</p>

            {fleets && (
              <div className="flex w-full overflow-auto">
                {fleets.map((fleet) => (
                  <FleetCard data={fleet} key={fleet.id.toString()} />
                ))}
              </div>
            )}
          </div>
          <div className="row-span-5">
            <p className="mb-4 mt-10 text-4xl font-bold">Feed</p>
            <InfiniteScroll
              dataLength={posts.length}
              next={getData}
              hasMore={hasMore}
              loader={<div>Loading</div>}
            >
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
              >
                <Masonry gutter={"1rem"} className="pr-4">
                  {posts.map((post) => (
                    <PostCard data={post} key={post.id.toString()} />
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            </InfiniteScroll>
          </div>
        </div>
      )}
    </>
  );
}
