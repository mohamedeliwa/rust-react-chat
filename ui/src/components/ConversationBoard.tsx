import React, { useCallback, useState } from "react";
import Avatar from "./Avatar";
import styles from "./ConversationBoard.module.css";
import useUser from "@/libs/useUser";
import { Message, Room, WsMessage, WsMessageType } from "@/libs/types";
import Conversation from "./conversation";
import useWebsocket from "@/libs/useWebsocket";
import NewMessageForm from "./NewMessageForm";

type Props = {
  room: Room;
  isLoading: boolean;
  addMessage: (message: Message) => void;
  messages: Message[];
};

const ConversationBoard = ({
  room,
  isLoading,
  addMessage,
  messages,
}: Props) => {
  const { user } = useUser();
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleTyping = (mode: string) => {
    if (mode === "IN") {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  };

  const onMessage = useCallback(
    (message: WsMessage) => {
      try {
        switch (message.chat_type) {
          case WsMessageType.TYPING: {
            handleTyping(message.value[0]);
            return;
          }
          case WsMessageType.TEXT: {
            addMessage({
              content: message.value[0],
              created_at: "",
              id: message.id.toString(),
              room_id: message.room_id,
              user_id: message.user_id,
            });
            return;
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    [addMessage]
  );

  const sendMessage = useWebsocket(onMessage);

  return (
    <section className={styles.room_body}>
      <div className={styles.room_banner}>
        <div className={styles.avatar}>
          <Avatar bgcolor="rgb(245 158 11)">
            {room.users
              .filter((user) => user.id !== user.id)
              .map((user) => user.username)
              .join("")}
          </Avatar>
          <div>
            <p className={styles.target_user}>
              {room.users
                .filter((user) => user.id !== user.id)
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
      <Conversation data={messages} auth={user} users={room.users} />
      <div className="w-full">
        <NewMessageForm
          sendMessage={sendMessage}
          room={room}
          addMessage={addMessage}
        />
      </div>
    </section>
  );
};

export default ConversationBoard;
