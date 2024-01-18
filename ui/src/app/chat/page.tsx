"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import Head from "next/head";
import useUser from "@/libs/useUser";
import { Room } from "@/libs/types";
import ChatAside from "@/components/ChatAside";
import ChatBoard from "@/components/ChatBoard";

const Chat = () => {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [router, user]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Rust with react chat app</title>
        <meta name="description" content="Rust with react chat app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <ChatAside setRoom={setRoom} />
        {room?.id && <ChatBoard room={room} />}
      </main>
    </div>
  );
};

export default Chat;
