import { useCallback, useState } from "react";
import styles from "./ConversationBoard.module.css";
import useUser from "@/libs/useUser";
import { Message, Room, WsMessage, WsMessageType } from "@/libs/types";
import Conversation from "./conversation";
import useWebsocket from "@/libs/useWebsocket";
import NewMessageForm from "./NewMessageForm";
import ConversationBanner from "./ConversationBanner";

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
