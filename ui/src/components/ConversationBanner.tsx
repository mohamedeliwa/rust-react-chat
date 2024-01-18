import React from "react";
import Avatar from "./Avatar";
import { Room } from "@/libs/types";
import styles from "./ConversationBanner.module.css";

type Props = {
  room: Room;
  isTyping: boolean;
};

const ConversationBanner = ({ room, isTyping }: Props) => {
  return (
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
  );
};

export default ConversationBanner;
