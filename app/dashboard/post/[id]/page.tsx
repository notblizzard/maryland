"use client";

import PostCard from "@/app/utils/PostCard";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function ViewPost({ params }: { params: { id: number } }) {
  const [post, setPost] = useState<Post>(null!);

  useEffect(() => {
    fetch(`/api/post?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => setPost(data.post));
  }, [params.id]);

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

  return (
    <div>
      {post && (
        <div className="w-[1000px]">
          <PostCard data={post} key={post.id.toString()} dimension={1000} />
          <p>{generateHashtags(post.description)}</p>
        </div>
      )}
    </div>
  );
}
