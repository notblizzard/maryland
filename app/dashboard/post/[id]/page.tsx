"use client";

import PostCard from "@/app/utils/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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
  image: string;
  description: string;
  createdAt: Date;
  _count: {
    comments: number;
    hearts: number;
  };
  hearted: boolean;
  comments: Comment[];
};

type Comment = {
  id: number;
  user: User;
  post: Post;
  text: string;
  createdAt: Date;
};

export default function ViewPost({ params }: { params: { id: number } }) {
  dayjs.extend(relativeTime);
  const [post, setPost] = useState<Post>(null!);
  const [newComment, setNewComment] = useState<string>("");

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

  const handleNewCommentSubmit = () => {
    fetch("/api/comment", {
      method: "POST",
      body: JSON.stringify({ id: post.id, text: newComment }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPost({
          ...post,
          comments: [data.comment, ...post.comments],
          _count: { ...post._count, comments: post._count.comments + 1 },
        });
        setNewComment("");
      });
  };

  return (
    <div>
      {post && (
        <div className="w-[1000px]">
          <PostCard
            data={post}
            key={post.id.toString()}
            dimension={1000}
            date
          />
          <p>{generateHashtags(post.description)}</p>
          {post.comments.map((comment) => (
            <div
              key={comment.id}
              className="my-4 rounded-lg border border-slate-400/40 p-4"
            >
              <div className="grid grid-cols-12">
                <div className="col-span-1">
                  <Avatar className="h-[40px] w-[40px]">
                    <AvatarImage
                      src={comment.user.avatar}
                      alt={comment.user.username}
                    />
                    <AvatarFallback></AvatarFallback>
                  </Avatar>
                </div>
                <div className="col-span-11">
                  <div className="flex flex-row justify-between">
                    <p className="text-lg font-bold">{comment.user.username}</p>
                    <p className="font-semibold text-emerald-400 dark:text-emerald-100">
                      {dayjs(comment.createdAt).fromNow()}
                    </p>
                  </div>
                  <p>{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={handleNewCommentSubmit} className="my-4 w-full">
            Submit Comment
          </Button>
        </div>
      )}
    </div>
  );
}
