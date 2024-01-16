import { User } from "@/components/Room";

/**
 * used for user registration
 * @param {object} user - The user to be created
 * @param {string} user.username - The name of the user
 * @param {string} user.phone - The phone of the user
 * @returns the created user object
 */
const create = async ({
  username,
  phone,
}: {
  username: string;
  phone: string;
}): Promise<User> => {
  try {
    const url = "http://localhost:8080/users/create";
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, phone }),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * used for user login
 * @param {object} credentials - The user credentials
 * @param {string} credentials.phone - The phone of the user
 * @returns the logged in user object
 */
const login = async ({ phone }: { phone: string }): Promise<User> => {
  try {
    const url = "http://localhost:8080/users/phone/" + phone;
    let response = await fetch(url);
    if (!response.ok) throw await response.json();
    return response.json();
  } catch (e) {
    return Promise.reject(e);
  }
};

const user = {
  create,
  login,
};

export default user;
