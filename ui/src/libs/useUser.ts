//  This Hook enables us to get the user data from localStorage:
"use client";

import { useRouter } from "next/navigation";
import { User } from "./types";

interface Props {
  user: User | null;
  setUser: (user: User) => void;
}

export default function useUser(): Props {
  const router = useRouter();

  const setUser = (user: User) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("user", JSON.stringify(user));
    router.push("chat");
  };

  if (typeof window === "undefined") {
    return {
      user: null,
      setUser,
    };
  }
  const value = window.localStorage.getItem("user");
  if (!value) {
    return {
      user: null,
      setUser,
    };
  }

  const user = JSON.parse(value as string) as User;

  return { user, setUser };
}
