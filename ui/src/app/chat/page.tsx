"use client";
import { useEffect, useState } from "react";
import useConversations from "@/libs/useConversation";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import Head from "next/head";
import useUser from "@/libs/useUser";
import { Room } from "@/libs/types";
import ChatAside from "@/components/ChatAside";
import ConversationBoard from "@/components/ConversationBoard";

const Chat = () => {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [router, user]);

  const { isLoading, messages, fetchConversations, addMessage } =
    useConversations();

  useEffect(() => {
    // fetch messages of the selected chat room when changes
    if (room?.id) {
      fetchConversations(room.id);
    }
  }, [fetchConversations, room?.id]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Rust with react chat app</title>
        <meta name="description" content="Rust with react chat app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <ChatAside setRoom={setRoom} />
        {room?.id && (
          <ConversationBoard
            room={room}
            isLoading={isLoading}
            addMessage={addMessage}
            messages={messages}
          />
        )}
      </main>
    </div>
  );
};

export default Chat;
