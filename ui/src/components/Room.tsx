import React, { useState, useEffect } from "react";
import Avatar from "./Avatar";
import styles from "./Room.module.css";

async function getRooms() {
  try {
    let user = JSON.parse(localStorage.getItem("user") as string);
    const url = `http://localhost:8080/rooms/${user?.id}`;
    let result = await fetch(url);
    return result.json();
  } catch (e) {
    console.log(e);
    return Promise.resolve(null);
  }
}

export interface User {
  id: string;
  username: string;
  phone: string;
}

export interface Room {
  id: string;
  users: User[];
  created_at: string;
  last_message: string;
}

interface ChatListItemProps {
  onSelect: Function;
  room: Room;
  userId: string;
  index: number;
  selectedItem: number;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  onSelect,
  room,
  userId,
  index,
  selectedItem,
}) => {
  const { users, created_at, last_message } = room;
  const active = index == selectedItem;
  const isoDateFormat = created_at.split(" ").reduce((prev, current, index) => {
    if (index === 0) {
      return prev + "T" + current;
    }
    return prev;
  });
  const date = new Date(isoDateFormat);

  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const time = `${date.getHours()}:${date.getMinutes()} ${ampm}`;
  const name = users
    ?.filter((user) => user.id != userId)
    .map((user) => user.username)[0];
  return (
    <div
      onClick={() => onSelect(index, {})}
      className={`${styles.chat_room} ${active ? styles.active_chat_room : ""}`}
    >
      <div className={styles.avatar_title_container}>
        <Avatar>{name}</Avatar>
        <div className={styles.title_container}>
          <h3 className={styles.title}>{name}</h3>
          <p className={styles.last_message}>{last_message}</p>
        </div>
      </div>
      <div className={styles.time_container}>
        <span className={styles.time}>{time}</span>
      </div>
    </div>
  );
};

interface ChatListProps {
  onChatChange: (data: Room) => void;
  userId: string;
}
const ChatList: React.FC<ChatListProps> = ({ onChatChange, userId }) => {
  const [data, setData] = useState<{ room: Room; users: User[] }[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(-1);
  useEffect(() => {
    setLoading(true);
    getRooms().then((data) => {
      setData(data);
      setLoading(false);
    });
  }, []);
  const onSelectedChat = (idx: number, item: { room: Room; users: User[] }) => {
    setSelectedItem(idx);
    onChatChange({ ...item.room, users: item.users });
  };
  return (
    <div className={styles.chat_rooms_container}>
      {isLoading && <p>Loading chat lists.</p>}
      {data.map((item, index) => {
        return (
          <ChatListItem
            onSelect={(idx: number) => onSelectedChat(idx, item)}
            room={{ ...item.room, users: item.users }}
            index={index}
            key={item.room.id}
            userId={userId}
            selectedItem={selectedItem}
          />
        );
      })}
    </div>
  );
};

export default ChatList;
