import React, { useEffect, useRef } from "react";
import Avatar from "./Avatar";
import styles from "./conversation.module.css";
import { User } from "@/libs/types";

const ConversationItem: React.FC<any> = ({ right, content, username }) => {
  if (right) {
    return (
      <div
        className={styles.item_container}
        style={{
          justifyContent: "flex-end",
        }}
      >
        <div
          className={styles.text_container}
          style={{
            backgroundColor: "rgb(139, 92, 246)",
            borderBottomRightRadius: 0,
          }}
        >
          <p className={styles.text}>{content}</p>
        </div>
        <div className={styles.avatar_container}>
          <Avatar>{username}</Avatar>
        </div>
      </div>
    );
  }
  return (
    <div
      className={styles.item_container}
      style={{
        justifyContent: "flex-start",
      }}
    >
      <div className={styles.avatar_container}>
        <Avatar bgcolor="rgb(245 158 11)">{username}</Avatar>
      </div>
      <div
        className={styles.text_container}
        style={{
          backgroundColor: "rgb(229, 231, 235)",
          borderBottomLeftRadius: 0,
        }}
      >
        <p>{content}</p>
      </div>
    </div>
  );
};

interface ConversationProps {
  data: any;
  auth: any;
  users: User[];
}

const Conversation: React.FC<ConversationProps> = ({ data, auth, users }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollTo(0, ref.current.scrollHeight);
  }, [data]);
  return (
    <div className={styles.chat_board} ref={ref}>
      {data.map((item: any) => {
        return (
          <ConversationItem
            right={item.user_id === auth.id}
            content={item.content}
            username={users.find((user) => user.id == item.user_id)?.username}
            key={`${item.id} ${Math.random()} `}
          />
        );
      })}
    </div>
  );
};

export default Conversation;
