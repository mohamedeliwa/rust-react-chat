"use client";
import { Message, Room, WsMessage, WsMessageType } from "@/libs/types";
import styles from "./NewMessageForm.module.css";
import { useState } from "react";
import useUser from "@/libs/useUser";

type Props = {
  room: Room;
  sendMessage: (msg: WsMessage) => void;
  addMessage: (message: Message) => void;
};

const NewMessageForm = ({ room, sendMessage, addMessage }: Props) => {
  const [message, setMessage] = useState<string>("");
  const { user } = useUser();

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
  );
};

export default NewMessageForm;
