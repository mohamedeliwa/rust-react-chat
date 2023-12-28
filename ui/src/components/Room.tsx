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

interface User {
  id: string;
  username: string;
  phone: string;
}

interface Room {
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
  const date = new Date(created_at);
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
      {/* <div className="flex justify-between items-center gap-3"> */}
      <div
        className={styles.avatar_title_container}
        // className="flex gap-3 items-center w-full"
      >
        <Avatar>{name}</Avatar>
        <div
          //  className="w-full max-w-[150px]"
          className={styles.title_container}
        >
          <h3
            //  className="font-semibold text-sm text-gray-700"
            className={styles.title}
          >
            {name}
          </h3>
          <p
            className={styles.last_message}
            //  className="font-light text-xs text-gray-600 truncate"
          >
            {last_message}
          </p>
        </div>
      </div>
      <div
        className={styles.time_container}
        //  className="text-gray-400 min-w-[55px]"
      >
        <span
          // className="text-xs"
          className={styles.time}
        >
          {time}
        </span>
      </div>
      {/* </div> */}
    </div>
  );
};

interface ChatListProps {
  onChatChange: Function;
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
    let mapUsers = new Map();
    item.users.forEach((el) => {
      mapUsers.set(el.id, el);
    });
    const users = {
      get: (id: string) => {
        return mapUsers.get(id)?.username;
      },
      get_target_user: (id: string) => {
        return item.users
          .filter((el) => el.id != id)
          .map((el) => el.username)
          .join("");
      },
    };
    onChatChange({ ...item.room, users });
  };
  return (
    <div
      className={styles.chat_rooms_container}
      // className="overflow-hidden space-y-3"
    >
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
