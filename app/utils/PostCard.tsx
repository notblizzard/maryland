import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegCommentAlt } from "react-icons/fa";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

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
  comments?: Comment[];
};

type Comment = {
  id: number;
  user: User;
  post: Post;
  text: string;
  createdAt: Date;
};

export default function PostCard({
  data,
  key,
  dimension,
  date,
}: {
  data: Post;
  key: string;
  dimension?: number;
  date?: boolean;
}) {
  dayjs.extend(relativeTime);
  const [post, setPost] = useState<Post>(data);
  const toggleHeart = (post: Post) => {
    fetch(`/api/heart/`, {
      body: JSON.stringify({ id: post.id }),
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setPost({
          ...post,
          hearted: data.hearted,
          _count: {
            ...post._count,
            hearts: post._count.hearts + (!data.hearted ? -1 : 1),
          },
        });
      });
  };

  return (
    <div key={key}>
      <Link href={`/dashboard/post/${post.id}`}>
        <Image
          src={post.image}
          alt={post.id.toString()}
          width={dimension || 500}
          height={dimension || 500}
          className="mb-3 h-auto  cursor-pointer rounded-xl"
        />
        <div className="mb-5 flex flex-row  items-center justify-between">
          <div className="flex flex-row items-center">
            <div className="rainbow-border flex h-[50px] w-[50px] items-center justify-center rounded-full">
              <div className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-background">
                <Link href={`/dashboard/@${post.user.username}`}>
                  <Avatar className="h-[35px] w-[35px]">
                    <AvatarImage
                      src={post.user.avatar}
                      alt={post.user.username}
                    />
                    <AvatarFallback></AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </div>
          </div>
          <div className={`flex flex-row`}>
            {date && (
              <p className="font-semibold text-emerald-400 dark:text-emerald-100">
                {dayjs(post.createdAt).fromNow()}
              </p>
            )}
            {post.hearted ? (
              <AiFillHeart
                className={`mx-1 h-5 w-5 text-rose-400`}
                onClick={() => toggleHeart(post)}
              />
            ) : (
              <AiOutlineHeart
                className={`mx-1 h-5 w-5`}
                onClick={() => toggleHeart(post)}
              />
            )}

            <p className="text-lg font-bold">{post._count.hearts}</p>
            <FaRegCommentAlt className="ml-4 mr-1 h-5 w-5" />
            <p className="text-lg font-bold">{post._count.comments}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
