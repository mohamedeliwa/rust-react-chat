"use client";

// We’ll use this Hook to fetch conversations based on the given room id:
import { useCallback, useEffect, useState } from "react";

const fetchRoomData = async (room_id: string) => {
  if (!room_id) return;
  const url = `http://localhost:8080/conversations/${room_id}`;
  try {
    let resp = await fetch(url).then((res) => res.json());
    return resp;
  } catch (e) {
    console.log(e);
  }
};

export default function useConversations() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const updateMessages = (resp = []) => {
    setIsLoading(false);
    console.log({ resp });

    setMessages(resp);
  };
  const fetchConversations = useCallback((id: string) => {
    setIsLoading(true);
    fetchRoomData(id).then(updateMessages);
  }, []);

  return { isLoading, messages, setMessages, fetchConversations };
}
