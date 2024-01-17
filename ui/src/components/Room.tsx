"use client";

import { useState, useEffect } from "react";
import Avatar from "./Avatar";
import styles from "./Room.module.css";
import useDateParser from "@/libs/useDateParser";
import room from "@/api/room";
import useUser from "@/libs/useUser";
import { Room, RoomsList, User } from "@/libs/types";

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
  const date = useDateParser(created_at);

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
  onChatChange: (room: Room) => void;
  userId: string;
}
const ChatList: React.FC<ChatListProps> = ({ onChatChange, userId }) => {
  const [rooms, setRooms] = useState<RoomsList>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(-1);
  const { user } = useUser();

  useEffect(() => {
    setLoading(true);
    if (user?.id) {
      room.getAll(user?.id).then((rooms) => {
        setRooms(rooms);
        setLoading(false);
      });
    }
  }, [user?.id]);

  const onSelectedChat = (
    idx: number,
    { room, users }: { room: Room; users: User[] }
  ) => {
    setSelectedItem(idx);
    onChatChange({ ...room, users });
  };

  return (
    <div className={styles.chat_rooms_container}>
      {isLoading && <p>Loading chat lists.</p>}
      {rooms.map(({ room, users }, index) => {
        return (
          <ChatListItem
            onSelect={(idx: number) => onSelectedChat(idx, { room, users })}
            room={{ ...room, users }}
            index={index}
            key={room.id}
            userId={userId}
            selectedItem={selectedItem}
          />
        );
      })}
    </div>
  );
};

export default ChatList;
