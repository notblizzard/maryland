import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

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

interface MessagesProps {
  user: User;
  direct: Direct;
}

export default function Messages({ user, direct }: MessagesProps) {
  dayjs.extend(relativeTime);

  return (
    <div className="flex grid w-full flex-col ">
      {direct.messages.map((message) => (
        <>
          {message.user.username === user.username ? (
            <>
              <div
                key={message.id}
                className="min-w-2/6 max-w-4/6  m-1 flex flex-row items-center justify-end justify-self-end"
              >
                <p className="break-all  rounded-bl-xl rounded-tl-xl rounded-tr-xl bg-sky-200 px-4 py-1 text-black">
                  {message.message}
                </p>
                <div className="flex flex-col ">
                  <Image
                    src={`https://cdn.notblizzard.dev/maryland/avatars/${message.user.avatar}.png`}
                    alt="Avatar"
                    className="ml-4 rounded-full"
                    height={35}
                    width={35}
                  />
                </div>
              </div>
              <p className="flex flex-row justify-self-end text-xs text-emerald-400 ">
                {dayjs(message.createdAt).fromNow()}
              </p>
            </>
          ) : (
            <>
              <div
                key={message.id}
                className="m-1 flex w-1/6 flex-row items-center justify-start justify-self-start"
              >
                {" "}
                <div className="flex flex-col">
                  <Image
                    src={`https://cdn.notblizzard.dev/maryland/avatars/${message.user.avatar}.png`}
                    alt="Avatar"
                    className=" mr-4 rounded-full"
                    height={35}
                    width={35}
                  />
                </div>
                <p className="rounded-br-xl  rounded-tl-xl rounded-tr-xl bg-slate-200 px-4 py-1 text-black">
                  {message.message}
                </p>
              </div>
              <p className="flex  flex-row  justify-self-start text-xs text-emerald-400">
                {dayjs(message.createdAt).fromNow()}
              </p>
            </>
          )}
        </>
      ))}
    </div>
  );
}
