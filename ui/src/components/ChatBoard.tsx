import { useEffect } from "react";
import styles from "./ChatBoard.module.css";
import useUser from "@/libs/useUser";
import { Room } from "@/libs/types";
import Conversation from "./conversation";
import NewMessageForm from "./NewMessageForm";
import ConversationBanner from "./ConversationBanner";
import useConversations from "@/libs/useConversation";

type Props = {
  room: Room;
};

const ChatBoard = ({ room }: Props) => {
  const { user } = useUser();
  const { isLoading, messages, fetchConversations, isTyping, sendMessage } =
    useConversations();

  useEffect(() => {
    // fetch messages of the selected chat room when changes
    if (room?.id) {
      fetchConversations(room.id);
    }
  }, [fetchConversations, room?.id]);

  return (
    <section className={styles.room_body}>
      <ConversationBanner room={room} isTyping={isTyping} />
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
        <NewMessageForm sendMessage={sendMessage} room={room} />
      </div>
    </section>
  );
};

export default ChatBoard;
