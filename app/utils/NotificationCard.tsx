import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { type } from "os";

type Notification = {
  id: number;
  user: User;
  post: Post;
  type: string;
  createdAt: Date;
};

type User = {
  id: number;
  username: string;
  email: string;
  description: string;
  displayname: string;
  avatar: string;
};

type Post = {
  id: number;
  user: User;
  image: string | File | null | undefined;
  description: string;
  createdAt: Date;
};

export default function NotificationCard({
  notification,
  key,
}: {
  notification: Notification;
  key: string;
}) {
  const notificationMessage = (type: string) => {
    switch (type) {
      case "HEART":
        return (
          <>
            liked your{" "}
            <Link
              href={`/posts/${notification.post.id}`}
              className="underline decoration-rose-400 decoration-2"
            >
              post
            </Link>
          </>
        );
      case "COMMENT":
        return (
          <>
            commented on your{" "}
            <Link href={`/posts/${notification.post.id}`}>post</Link>
          </>
        );
      case "FOLLOW":
        return " started following you";
    }
  };
  return (
    <div key={key} className="flex w-full flex-row items-center justify-center">
      <Avatar className="h-[35px] w-[35px]">
        <AvatarImage
          src={notification.user.avatar}
          alt={notification.user.username}
        />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <p>{notification.user.username}</p>{" "}
      <p>{notificationMessage(notification.type)}</p>
    </div>
  );
}
