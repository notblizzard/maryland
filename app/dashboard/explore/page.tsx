"use client";
import PostCard from "@/app/utils/PostCard";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

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

export default function Explore() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const getData = useCallback(() => {
    fetch(`/api/explore?skip=${skip}`)
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
      <p>Explore</p>

      <InfiniteScroll
        dataLength={posts.length}
        next={getData}
        hasMore={hasMore}
        loader={<div>Loading</div>}
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
