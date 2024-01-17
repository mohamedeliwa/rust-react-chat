export interface User {
  id: string;
  username: string;
  phone: string;
}

export interface Room {
  id: string;
  users: User[];
  created_at: string;
  last_message: string;
}

export interface Message {
  content: string;
  created_at: string;
  id: string;
  room_id: string;
  user_id: string;
}

export type RoomsList = {
  room: Room;
  users: User[];
}[];
