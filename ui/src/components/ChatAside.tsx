"use client";

import React from "react";
import Rooms from "./Rooms";
import NewRoom from "./NewRoom";
import styles from "./ChatAside.module.css";
import { useRouter } from "next/navigation";
import { Room } from "@/libs/types";
import userApi from "@/api/user";

type Props = {
  setRoom: (room: Room) => void;
};

const ChatAside = ({ setRoom }: Props) => {
  const router = useRouter();

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
      <div className={styles.rooms}>
        <Rooms onRoomChange={onRoomChange} />
      </div>

      <div className={styles.controls}>
        <NewRoom />
        <button onClick={signOut} className={styles.signout}>
          LOG OUT
        </button>
      </div>
    </aside>
  );
};

export default ChatAside;
