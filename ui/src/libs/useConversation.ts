"use client";
// We’ll use this Hook to fetch conversations based on the given room id:

import room from "@/api/room";
import { useCallback, useState } from "react";
import { Message, WsMessage, WsMessageType } from "./types";
import useWebsocket from "./useWebsocket";

export default function useConversations() {
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // fetches conversation of first opening to chat room
  const fetchConversations = useCallback((id: string) => {
    setIsLoading(true);
    room.getMessages(id).then((messages: Message[] = []) => {
      setIsLoading(false);
      setMessages(messages);
    });
  }, []);

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

  const sendWsMessage = useWebsocket(onMessage);

  const sendMessage = (msg: WsMessage) => {
    sendWsMessage(msg);
    if (msg.chat_type == WsMessageType.TEXT) {
      addMessage({
        content: msg.value[0],
        created_at: "",
        id: "",
        room_id: msg.room_id,
        user_id: msg.user_id,
      });
    }
  };

  return {
    isLoading,
    messages,
    fetchConversations,
    isTyping,
    sendMessage,
  };
}
