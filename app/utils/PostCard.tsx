import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegCommentAlt } from "react-icons/fa";
import Image from "next/image";
import { useState } from "react";

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

export default function PostCard({ data, key }: { data: Post; key: string }) {
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
      <Image
        src={`https://cdn.notblizzard.dev/maryland/uploads/${post.image}.png`}
        alt={post.id.toString()}
        width={500}
        height={500}
        className="mb-3 h-auto max-w-full cursor-pointer rounded-xl"
      />
      <div className="mb-5 flex flex-row justify-between">
        <div className="flex flex-row items-center">
          <div className="rainbow-border flex h-[50px] w-[50px] items-center justify-center rounded-full">
            <div className="bg-background flex h-[45px] w-[45px] items-center justify-center rounded-full">
              <Image
                src={`https://cdn.notblizzard.dev/maryland/avatars/${post.user.avatar}.png`}
                alt={post.user.username}
                width={35}
                height={35}
                className="cursor-pointer rounded-full"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center">
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
    </div>
  );
}
