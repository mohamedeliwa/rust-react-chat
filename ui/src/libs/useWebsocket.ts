"use client";

//  This Hook is for connecting to the WebSocket server, enabling us to send and receive messages:
import { useEffect, useRef } from "react";
import useUser from "./useUser";
import websocket from "@/api/websocket";

export default function useWebsocket(onMessage: Function) {
  const ws = useRef<WebSocket | null>(null);
  let { user } = useUser();

  useEffect(() => {
    if (ws.current !== null) return;
    ws.current = websocket.connect(user?.id);
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");
    return () => {
      // cleaning on unmounting
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (!ws.current) return;
    ws.current.onmessage = (e) => {
      onMessage(e.data);
    };
  }, [onMessage]);

  const sendMessage = (msg: string) => {
    if (!ws.current) return;
    ws.current.send(msg);
  };

  return sendMessage;
}
