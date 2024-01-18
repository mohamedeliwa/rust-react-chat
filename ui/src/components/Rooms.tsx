"use client";

import { useState, useEffect } from "react";
import Avatar from "./Avatar";
import styles from "./Room.module.css";
import useDateParser from "@/libs/useDateParser";
import room from "@/api/room";
import useUser from "@/libs/useUser";
import { Room } from "@/libs/types";

interface ChatRoomProps {
  onSelect: Function;
  room: Room;
  userId: string;
  active: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  onSelect,
  room,
  userId,
  active,
}) => {
  const date = useDateParser(room.created_at);
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const time = `${date.getHours()}:${date.getMinutes()} ${ampm}`;

  // get the other participant username
  const name = room.users
    ?.filter((user) => user.id != userId)
    .map((user) => user.username)[0];

  return (
    <div
      onClick={() => onSelect()}
      className={`${styles.chat_room} ${active ? styles.active_chat_room : ""}`}
    >
      <div className={styles.avatar_title_container}>
        <Avatar>{name}</Avatar>
        <div className={styles.title_container}>
          <h3 className={styles.title}>{name}</h3>
          <p className={styles.last_message}>{room.last_message}</p>
        </div>
      </div>
      <div className={styles.time_container}>
        <span className={styles.time}>{time}</span>
      </div>
    </div>
  );
};

interface RoomsProps {
  onRoomChange: (room: Room) => void;
}

const Rooms: React.FC<RoomsProps> = ({ onRoomChange }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [selectedRoomID, setSelectedRoomID] = useState<string>("");
  const { user } = useUser();

  useEffect(() => {
    // fetching all user's rooms
    setLoading(true);
    if (user?.id) {
      room.getAll(user?.id).then((rooms) => {
        setRooms(rooms);
        setLoading(false);
      });
    }
  }, [user?.id]);

  const handleRoomChange = (room: Room) => {
    setSelectedRoomID(room.id);
    onRoomChange(room);
  };

  return (
    <div className={styles.chat_rooms_container}>
      {isLoading && <p>Loading chat lists.</p>}
      {rooms.map((room, index) => {
        return (
          <ChatRoom
            onSelect={() => handleRoomChange(room)}
            room={room}
            key={room.id}
            userId={user?.id || ""}
            active={selectedRoomID === room.id}
          />
        );
      })}
    </div>
  );
};

export default Rooms;
