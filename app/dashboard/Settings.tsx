import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import { useState, useRef, SetStateAction, Dispatch } from "react";
import Image from "next/image";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type User = {
  id: number;
  username: string;
  displayname: string;
  email: string;
  description: string;
  avatar: string;
};

export default function Settings({
  user,
  setUser,
}: {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
}) {
  const [avatar, setAvatar] = useState("");
  const [cropper, setCropper] = useState("");
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (typeof cropper !== "undefined") {
      setCropper(cropper?.getCroppedCanvas().toDataURL());
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsCropperOpen(true);
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSettingsSubmit = () => {
    const form = new FormData();
    if (cropper) form.append("avatar", cropper);
    form.append("username", user.username);
    form.append("displayname", user.displayname);
    form.append("description", user.description);
    fetch("/api/user", {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUser(data.user);
      });
  };

  return (
    <Sheet>
      <SheetTrigger>
        <HamburgerMenuIcon className="mr-4 h-4 w-4 text-black" />
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col items-center justify-center">
          <p className="text-2xl">Update Settings</p>
          {avatar && (
            <Dialog
              open={isCropperOpen}
              onOpenChange={() => setIsCropperOpen(!isCropperOpen)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Avatar</DialogTitle>
                  <DialogDescription>
                    Crop your avatar to your liking
                  </DialogDescription>
                </DialogHeader>
                <Cropper
                  src={avatar}
                  style={{ height: 400, width: "100%" }}
                  initialAspectRatio={1}
                  aspectRatio={1}
                  guides={true}
                  ref={cropperRef}
                  crop={onCrop}
                  movable={false}
                  rotatable={false}
                  scalable={false}
                />
                <Button
                  className="mt-4 bg-sky-500 p-4"
                  onClick={() => setIsCropperOpen(false)}
                >
                  Save
                </Button>
              </DialogContent>
            </Dialog>
          )}
          <label htmlFor="profile">
            {cropper && !isCropperOpen ? (
              <>
                <Image
                  src={cropper}
                  alt={user.username}
                  width={100}
                  height={100}
                  className="m-2 cursor-pointer  rounded-full border-2 border-solid border-slate-950"
                />
                <div className="relative"></div>
              </>
            ) : (
              <>
                <Image
                  src={`https://cdn.notblizzard.dev/maryland/avatars/${user.avatar}.png`}
                  alt={user.username}
                  width={100}
                  height={100}
                  className="m-2 cursor-pointer  rounded-full border-2 border-solid border-slate-950"
                />
                <div className="relative"></div>
              </>
            )}
          </label>
          <input
            id="profile"
            type="file"
            name="profile"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleProfileChange}
            className="hidden w-full cursor-pointer border border-gray-700 bg-gray-50 file:border file:border-none file:bg-gray-800 file:text-white dark:bg-gray-700"
          />
          <div className="flex w-full flex-col">
            <Label htmlFor="username">Username</Label>
            <Input
              name="username"
              id="username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="w-full text-black"
              placeholder="Username"
            />
          </div>
          <div className="flex w-full flex-col">
            <Label htmlFor="displayname">Display Name</Label>
            <Input
              name="displayname"
              id="displayname"
              value={user.displayname}
              onChange={(e) =>
                setUser({ ...user, displayname: e.target.value })
              }
              className="w-full text-black"
              placeholder="Username"
            />
          </div>
          <div className="flex w-full flex-col">
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              id="description"
              value={user.description}
              onChange={(e) =>
                setUser({ ...user, description: e.target.value })
              }
              className="w-full text-black"
              placeholder="Description"
            />
          </div>
        </div>
        <div>
          <Button className="mt-1 w-full" onClick={handleSettingsSubmit}>
            Save
          </Button>
        </div>
        <div>
          <Button
            className="mt-4 w-full bg-rose-400 hover:bg-rose-400/80"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
