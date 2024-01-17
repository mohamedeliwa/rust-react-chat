/**
 * create a new chat room between two users
 * @param user - The user id that creates the room
 * @param phone - The phone of the user to create the room with
 * @returns the created room object
 */
const create = async (user: string, phone: string) => {
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

const room = {
  create,
};

export default room;
