import React, { useCallback, useState } from "react";
import Avatar from "./Avatar";
import styles from "./ConversationBoard.module.css";
import useUser from "@/libs/useUser";
import { Message, Room, WsMessage, WsMessageType } from "@/libs/types";
import Conversation from "./conversation";
import useWebsocket from "@/libs/useWebsocket";

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
  const [message, setMessage] = useState<string>("");
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

  const sendWsMessage = (msg: string, type: WsMessageType) => {
    const data = {
      id: 0,
      chat_type: type,
      value: [msg],
      room_id: room?.id || "",
      user_id: user.id,
    };
    sendMessage(data);
  };

  const submitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message === "") {
      return;
    }
    if (!room?.id) {
      alert("Please select chat room!");
      return;
    }
    sendWsMessage(message, WsMessageType.TEXT);

    const msg: Message = {
      content: message,
      created_at: "",
      id: "",
      room_id: room.id,
      user_id: user.id,
    };
    addMessage(msg);
    setMessage("");
  };

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
        <form onSubmit={submitMessage} className={styles.form}>
          <input
            onFocus={() => {
              // indcating that user started typing
              sendWsMessage("IN", WsMessageType.TYPING);
            }}
            onBlur={() => {
              // indicating that user stopped typing
              sendWsMessage("OUT", WsMessageType.TYPING);
            }}
            onChange={(e) => {
              const value = e.target.value;
              setMessage(value);
            }}
            value={message}
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
  );
};

export default ConversationBoard;
