"use client";

import PostCard from "@/app/utils/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ScaleLoader } from "react-spinners";

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

export default function ViewProfile({ params }: { params: { slug: string } }) {
  const [user, setUser] = useState<User>(null!);
  const [posts, setPosts] = useState<Post[]>([]!);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const { data: session } = useSession();
  const [following, setFollowing] = useState(false);

  const generateHashtags = (description: string) => {
    const hashtags = description.match(/#[a-z]+/gi);
    if (hashtags) {
      return hashtags.map((hashtag) => (
        <Link
          key={hashtag}
          href={`/dashboard/hashtag/${hashtag.replace("#", "")}`}
          className="text-sky-400"
        >
          {hashtag}
        </Link>
      ));
    }
    return description;
  };

  const getData = useCallback(() => {
    fetch(`/api/profile?username=${params.slug}&skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setPosts(posts.concat(data.posts));
        setSkip(skip + 1);
        if (data.noMore) setHasMore(false);
      });
  }, [skip]);

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/following?username=${params.slug}`)
        .then((res) => res.json())
        .then((data) => setFollowing(data.following));
    }
    getData();
  }, []);

  const toggleFollow = () => {
    fetch(`/api/following/`, {
      body: JSON.stringify({ id: user.id }),
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setFollowing(data.following);
      });
  };

  return (
    <>
      {user && posts && (
        <>
          <div className="m-12 flex flex-col">
            <div className="grid grid-cols-12">
              <div className="col-span-3">
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <Avatar className="h-[200px] w-[200px]">
                    <AvatarImage
                      src={`https://cdn.notblizzard.dev/maryland/avatars/${user.avatar}.png`}
                      alt={user.username}
                    />
                    <AvatarFallback></AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="col-span-1"></div>
              <div className="col-span-6">
                <div className="flex flex-row items-center">
                  <p className="mr-4 text-4xl font-bold">{user.displayname}</p>
                  {following ? (
                    <Button
                      onClick={() => toggleFollow()}
                      onMouseOver={(e) =>
                        ((e.target as HTMLElement).textContent = "Unfollow")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).textContent = "Following")
                      }
                      className="w-24 hover:border-rose-400"
                      variant={"outline"}
                    >
                      Following
                    </Button>
                  ) : (
                    <Button onClick={() => toggleFollow()}>Follow</Button>
                  )}
                </div>
                <div className="w-4/6">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row">
                      <p className="text-lg font-bold">{user._count.posts}</p>
                      <p className="text-lg">Posts</p>
                    </div>
                    <div className="flex flex-row">
                      <p className="text-lg font-bold">
                        {user._count.followers}
                      </p>
                      <p className="text-lg">Followers</p>
                    </div>
                    <div className="flex flex-row">
                      <p className="text-lg font-bold">
                        {user._count.following}
                      </p>
                      <p className="text-lg">Following</p>
                    </div>
                  </div>
                </div>
                <div>{generateHashtags(user.description)}</div>
              </div>
            </div>
          </div>
          <InfiniteScroll
            dataLength={posts.length}
            next={getData}
            hasMore={hasMore}
            loader={
              <div className="flex w-full flex-row justify-center">
                <ScaleLoader color="#36d7b7" />{" "}
              </div>
            }
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
        </>
      )}
    </>
  );
}
