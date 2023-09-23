"use client";
import PostCard from "@/app/utils/PostCard";
import { useSearchParams } from "next/navigation";
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

export default function Search() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const search = searchParams.get("params")!;

  const getData = useCallback(() => {
    fetch(`/api/search?params=${search}&skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(posts.concat(data.posts));
        setSkip(skip + 1);
        if (data.noMore) setHasMore(false);
      });
  }, [skip]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <p>Search</p>

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
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry gutter={"1rem"} className="pr-4">
            {posts.map((post) => (
              <PostCard data={post} key={post.id.toString()} />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </InfiniteScroll>
    </>
  );
}
