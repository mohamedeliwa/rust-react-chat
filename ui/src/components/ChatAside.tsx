"use client";

import React from "react";
import Rooms from "./Rooms";
import NewRoom from "./NewRoom";
import styles from "./ChatAside.module.css";
import { useRouter } from "next/navigation";
import { Room } from "@/libs/types";
import useUser from "@/libs/useUser";
import userApi from "@/api/user";

type Props = {
  setRoom: (room: Room) => void;
};

const ChatAside = ({ setRoom }: Props) => {
  const router = useRouter();
  const { user } = useUser();

  const signOut = () => {
    userApi.logout();
    router.push("/");
  };

  const onRoomChange = (room: Room) => {
    if (!room.id) return;
    setRoom(room);
  };

  return (
    <aside className={styles.aside}>
      <Rooms onRoomChange={onRoomChange} />

      <NewRoom />
      <button onClick={signOut} className={styles.signout}>
        LOG OUT
      </button>
    </aside>
  );
};

export default ChatAside;
