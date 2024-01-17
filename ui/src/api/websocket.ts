const connect = (user: string): WebSocket => {
  try {
    const url = `ws://localhost:8080/ws/${user || ""}`;
    return new WebSocket(url);
  } catch (e) {
    throw e;
  }
};

const websocket = {
  connect,
};

export default websocket;
