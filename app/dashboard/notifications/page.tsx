"use client";

import NotificationCard from "@/app/utils/NotificationCard";
import PostCard from "@/app/utils/PostCard";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ScaleLoader } from "react-spinners";

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
export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const getData = useCallback(() => {
    fetch(`/api/notification?skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(notifications.concat(data.notifications));
        setSkip(skip + 1);
        if (data.noMore) setHasMore(false);
      });
  }, [skip]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="col-span-10 h-screen w-full">
      <h1>Notifications</h1>
      <InfiniteScroll
        dataLength={notifications.length}
        next={getData}
        hasMore={hasMore}
        loader={
          <div className="flex w-full flex-row justify-center">
            <ScaleLoader color="#36d7b7" />{" "}
          </div>
        }
      >
        {notifications.map((notification) => (
          <NotificationCard
            notification={notification}
            key={notification.id.toString()}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
}
