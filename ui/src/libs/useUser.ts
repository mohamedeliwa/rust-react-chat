//  This Hook enables us to get the user data from localStorage:
"use client";

import { User } from "@/components/Room";

export default function useUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }
  const value = window.localStorage.getItem("user");
  if (!value) {
    return null;
  }
  const user = JSON.parse(value as string) as User;

  return user;
}
