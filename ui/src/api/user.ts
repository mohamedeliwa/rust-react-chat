import { User } from "@/components/Room";

/**
 * used to add a new user to the database
 * used for the signup functionality
 * @param user object to be created
 * @returns the created user object
 * @todo implement the function
 */
const create = (user: User): User => {
  return user;
};

/**
 * used to fetch a user by his phone number
 * used for login functionality
 * @param phone of the user
 * @returns the logged in user object
 * @todo implement the function
 */
const getOne = (phone: string): User => {
  return {} as User;
};

const user = {
  create,
  getOne,
};

export default user;
