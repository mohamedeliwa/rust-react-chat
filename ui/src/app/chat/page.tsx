"use client";
import React, { useCallback, useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import ChatList, { Room, User } from "@/components/Room";
import Conversation from "@/components/conversation";
import useConversations from "@/libs/useConversation";
import useWebsocket from "@/libs/useWebsocket";
import NewRoom from "@/components/NewRoom";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import Head from "next/head";
import useUser from "@/libs/useUser";

/**
 * 
 * The following functions will handle all messages coming in or out of the WebSocket server:

 * handleTyping: Updates the state to display the typing indicator
 * handleMessage: Handles incoming and outgoing messages to the state
 * onMessage: Handles messages retrieved from the WebSocket server
 * updateFocus: Tells the WebSocket server if the current user is still typing a message
 * onFocusChange: Lets the WebSocket server know when the current user is finished typing
 * submitMessage: Updates the message state and then sends the message to the server when a user hits the send button
 * updateMessages: Fetches the conversation of the given room id when a user switches chat rooms
 * signOut: Updates the state to signout and removes the user data from local storage
 * 
 * 
 * 
 */

const Chat = () => {
  const router = useRouter();
  const [room, setSelectedRoom] = useState<Room | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const value = useUser();

  useEffect(() => {
    if (!value) {
      router.replace("/");
    }
  }, [router, value]);

  const authenticatedUser = value as User;

  // const authenticatedUser = JSON.parse(auth as string) as User;
  const { isLoading, messages, setMessages, fetchConversations } =
    useConversations();

  const handleTyping = (mode: string) => {
    if (mode === "IN") {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  };
  const handleMessage = useCallback(
    (msg: string, userId: string) => {
      setMessages((prev) => {
        const item = { content: msg, user_id: userId };
        return [...prev, item];
      });
    },
    [setMessages]
  );
  const onMessage = useCallback(
    (data: string) => {
      try {
        let messageData = JSON.parse(data);
        switch (messageData.chat_type) {
          case "TYPING": {
            handleTyping(messageData.value[0]);
            return;
          }
          case "TEXT": {
            handleMessage(messageData.value[0], messageData.user_id);
            return;
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    [handleMessage]
  );
  const sendMessage = useWebsocket(onMessage);
  const updateFocus = () => {
    const data = {
      id: 0,
      chat_type: "TYPING",
      value: ["IN"],
      room_id: room?.id,
      user_id: authenticatedUser.id,
    };
    sendMessage(JSON.stringify(data));
  };
  const onFocusChange = () => {
    const data = {
      id: 0,
      chat_type: "TYPING",
      value: ["OUT"],
      room_id: room?.id,
      user_id: authenticatedUser.id,
    };
    sendMessage(JSON.stringify(data));
  };

  interface CustomTarget extends EventTarget {
    message: {
      value: string;
    };
  }
  const submitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as CustomTarget;
    let message = target.message.value;
    if (message === "") {
      return;
    }
    if (!room?.id) {
      alert("Please select chat room!");
      return;
    }
    const data = {
      id: 0,
      chat_type: "TEXT",
      value: [message],
      room_id: room?.id,
      user_id: authenticatedUser.id,
    };
    sendMessage(JSON.stringify(data));
    target.message.value = "";
    handleMessage(message, authenticatedUser.id);
    onFocusChange();
  };

  const updateMessages = (data: Room) => {
    if (!data.id) return;
    fetchConversations(data.id);
    setSelectedRoom(data);
  };
  const signOut = () => {
    window.localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Rust with react chat app</title>
        <meta name="description" content="Rust with react chat app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <aside className={styles.aside}>
          <ChatList
            onChatChange={updateMessages}
            userId={authenticatedUser?.id}
          />

          <NewRoom />
          <button onClick={signOut} className={styles.signout}>
            LOG OUT
          </button>
        </aside>
        {room?.id && (
          <section className={styles.room_body}>
            <div className={styles.room_banner}>
              <div className={styles.avatar}>
                <Avatar bgcolor="rgb(245 158 11)">
                  {room.users
                    .filter((user) => user.id !== authenticatedUser.id)
                    .map((user) => user.username)
                    .join("")}
                </Avatar>
                <div>
                  <p className={styles.target_user}>
                    {room.users
                      .filter((user) => user.id !== authenticatedUser.id)
                      .map((user) => user.username)
                      .join("")}
                  </p>
                  <div className={styles.banner_time}>
                    {isTyping ? "Typing..." : "10:15 AM"}
                  </div>
                </div>
              </div>
              <hr
                style={{
                  background: "#F0EEF5",
                }}
              />
            </div>
            {isLoading && room.id && (
              <p
                style={{
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  color: "rgb(100 116 139)",
                }}
              >
                Loading conversation...
              </p>
            )}
            <Conversation
              data={messages}
              auth={authenticatedUser}
              users={room.users}
            />
            <div className="w-full">
              <form onSubmit={submitMessage} className={styles.form}>
                <input
                  onBlur={onFocusChange}
                  onFocus={updateFocus}
                  name="message"
                  className={styles.input}
                  placeholder="Type your message here..."
                />
                <button type="submit" className={styles.button}>
                  Sent
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Chat;
