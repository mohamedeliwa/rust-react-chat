import { Room, RoomsList } from "@/libs/types";

/**
 * create a new chat room between two users
 * @param user - The user id that creates the room
 * @param phone - The phone of the user to create the room with
 * @returns the created room object
 */
const create = async (user: string, phone: string): Promise<Room> => {
  try {
    const url = `http://localhost:8080/rooms/${user}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * fetches all chat rooms for a user
 * @param user - The user id for whom to fetch all rooms
 * @returns a list of all chat rooms
 */
const getAll = async (user: string): Promise<RoomsList> => {
  try {
    const url = `http://localhost:8080/rooms/${user}`;
    let response = await fetch(url);
    if (!response.ok) throw await response.json();
    return response.json();
  } catch (e) {
    return Promise.reject(e);
  }
};

const room = {
  create,
  getAll,
};

export default room;
