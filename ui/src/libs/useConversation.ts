"use client";
// We’ll use this Hook to fetch conversations based on the given room id:

import room from "@/api/room";
import { useCallback, useState } from "react";
import { Message } from "./types";

export default function useConversations() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);

  const updateMessages = (messages: Message[] = []) => {
    setIsLoading(false);
    setMessages(messages);
  };

  const addMessage = (message: Message) => {
    setIsLoading(false);
    setMessages((prev) => [...prev, message]);
  };

  const fetchConversations = useCallback((id: string) => {
    setIsLoading(true);
    room.getMessages(id).then(updateMessages);
  }, []);

  return { isLoading, messages, fetchConversations, addMessage };
}
