"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useForm, SubmitHandler, set } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AiFillCamera } from "react-icons/ai";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { signOut, useSession } from "next-auth/react";
import { FaSquarePen } from "react-icons/fa6";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Messages from "./Messages";
import { GiHamburgerMenu } from "react-icons/gi";
import { useRouter, useSearchParams } from "next/navigation";
import PusherClient from "pusher-js";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type Direct = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  members: User[];
  messages: Message[];
};

type Message = {
  id: number;
  createdAt: Date;
  user: User;
  direct: Direct;
  message: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  avatar: string;
  directs: Direct[];
  messages: Message[];
};

type NewDirectInputs = {
  username: string;
};

export default function MessagesPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User>(null!);
  const [message, setMessage] = useState<string>("");
  const [direct, setDirect] = useState<string>("");
  const router = useRouter();
  const messageEndRef = useRef(null);
  const [isNewDirectOpen, setIsNewDirectOpen] = useState(false);
  const [usernames, setUsernames] = useState<string[]>([]);

  dayjs.extend(relativeTime);

  useEffect(() => {
    if (user) {
      const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: "us2",
      });
      const channel = pusher.subscribe(`direct-${user.id}`);
      channel.bind("message", (message: Message) => {
        setUser({
          ...user,
          directs: user.directs.map((direct) => {
            if (direct.id === message.direct.id) {
              direct.messages.push(message);
              return direct;
            } else {
              return direct;
            }
          }),
        });
      });
      channel.bind("direct", (direct: Direct) => {
        console.log("new direct!");
        setUser({
          ...user,
          directs: [direct].concat(user.directs),
        });
      });
      return () => {
        pusher.unsubscribe(`direct-${user.id}`);
      };
    }
  }, []);

  const handleDirectOpen = () => {
    setIsNewDirectOpen(!isNewDirectOpen);
    if (isNewDirectOpen) return;
    fetch("/api/usernames").then((res) =>
      res.json().then((data) => {
        setUsernames(data.usernames);
      }),
    );
  };

  const handleDirectSubmit = () => {
    setIsNewDirectOpen(false);
    fetch("/api/direct", {
      method: "POST",
      body: JSON.stringify({ username: direct }),
    }).then(() => setDirect(""));
  };

  const handleMessageSubmit = (e) => {
    if (e.keyCode !== 13) return;
    const id = e.target.getAttribute("data-id");
    fetch("/api/message", {
      method: "POST",
      body: JSON.stringify({ message, id }),
    }).then(() => setDirect(""));
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [user]);

  useEffect(() => {
    if (session) {
      fetch("/api/direct")
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setUser(data.user);
        });
    } else {
      router.push("/");
    }
  }, [session, router]);

  return (
    <>
      {user && (
        <>
          {" "}
          <div className="h-[80vh] px-4 text-white">
            <Tabs
              className="flex flex-row"
              orientation="vertical"
              defaultValue={user?.directs[0]?.id.toString()}
            >
              <TabsList className=" mt-4 flex min-h-full w-2/6 flex-col justify-start bg-transparent">
                <div className="flex w-full flex-row justify-between px-3">
                  <div className="flex w-full flex-row items-center">
                    <Dialog
                      open={isNewDirectOpen}
                      onOpenChange={handleDirectOpen}
                    >
                      <DialogTrigger className="w-full p-4">
                        <Button className="w-full p-4">New Direct</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>New Message</DialogTitle>
                          <DialogDescription>
                            <Command
                              value={direct}
                              onValueChange={(e) => setDirect(e)}
                            >
                              <CommandInput placeholder="Username" />
                              <CommandList>
                                <CommandEmpty>No users found</CommandEmpty>
                                {usernames &&
                                  usernames.slice(0, 4).map((username) => (
                                    <CommandItem
                                      key={username}
                                      className="rounded-none"
                                      onClick={(e) =>
                                        setDirect(e.target.innerHTML)
                                      }
                                    >
                                      {username}
                                    </CommandItem>
                                  ))}
                              </CommandList>
                            </Command>

                            <button onClick={() => handleDirectSubmit()}>
                              Submit
                            </button>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {user.directs.map((direct) => (
                  <div
                    className="flex max-h-[80vh] w-full flex-col"
                    key={direct.id}
                  >
                    <TabsTrigger
                      className="mx-0 mt-4 flex w-full flex-row items-center justify-start"
                      value={direct.id.toString()}
                    >
                      <Image
                        src={`https://cdn.notblizzard.dev/maryland/avatars/${
                          direct.members.filter(
                            (member) => member.username !== user.username,
                          )[0].avatar
                        }.png`}
                        alt="Avatar"
                        className="mx-4 rounded-full"
                        height={60}
                        width={60}
                      />
                      <div className="flex flex-col items-start justify-start">
                        <p>
                          {
                            direct.members.filter(
                              (member) => member.username !== user.username,
                            )[0].username
                          }
                        </p>
                        <p className="text-xs text-slate-400">
                          {
                            direct?.messages?.filter(
                              (message) =>
                                message.user.username !== user.username,
                            )[0]?.message
                          }
                        </p>
                        <p className="text-xs text-emerald-400">
                          {dayjs(
                            direct?.messages?.filter(
                              (message) =>
                                message.user.username !== user.username,
                            )[0]?.createdAt,
                          ).fromNow()}
                        </p>
                      </div>
                    </TabsTrigger>
                  </div>
                ))}
              </TabsList>
              {user.directs.map((direct) => (
                <TabsContent
                  value={direct.id.toString()}
                  key={direct.id}
                  className="h-full w-full"
                >
                  <div className="flex h-[90vh] w-full flex-col justify-between">
                    <div className="ml-4 mt-4 flex w-full flex-row justify-start text-black">
                      <Image
                        src={`https://cdn.notblizzard.dev/maryland/avatars/${
                          direct.members.filter(
                            (member) => member.username !== user.username,
                          )[0].avatar
                        }.png`}
                        alt="Avatar"
                        className="mx-4 rounded-full"
                        height={60}
                        width={60}
                      />
                      <p className="flex flex-row items-center text-xl font-bold text-black">
                        {
                          direct.members.filter(
                            (member) => member.username !== user.username,
                          )[0].username
                        }
                      </p>
                    </div>
                    <div className="flex w-full flex-col  overflow-auto">
                      <Messages user={user} direct={direct} key={direct.id} />
                      <div ref={messageEndRef} />
                    </div>
                    <div>
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={"w-full text-black"}
                        placeholder="Message...."
                        data-id={direct.id}
                        onKeyDown={handleMessageSubmit}
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </>
      )}
    </>
  );
}
