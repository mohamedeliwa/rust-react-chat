"use client";

import React from "react";
import ChatList from "./Room";
import NewRoom from "./NewRoom";
import styles from "./ChatAside.module.css";
import { useRouter } from "next/navigation";
import { Room } from "@/libs/types";
import useUser from "@/libs/useUser";

type Props = {
  setSelectedRoom: Function;
  fetchConversations: Function;
};

const ChatAside = ({ setSelectedRoom, fetchConversations }: Props) => {
  const router = useRouter();
  const { user } = useUser();

  const signOut = () => {
    user.logout();
    router.push("/");
  };

  const onRoomChange = (room: Room) => {
    if (!room.id) return;
    fetchConversations(room.id);
    setSelectedRoom(room);
  };

  return (
    <aside className={styles.aside}>
      <ChatList onChatChange={onRoomChange} userId={user?.id} />

      <NewRoom />
      <button onClick={signOut} className={styles.signout}>
        LOG OUT
      </button>
    </aside>
  );
};

export default ChatAside;
