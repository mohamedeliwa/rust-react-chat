"use client";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import Login from "../components/Login";
import { useRouter } from "next/navigation";
import useUser from "@/libs/useUser";
import { User } from "@/components/Room";

export default function Home() {
  const router = useRouter();
  const [showLogIn, setShowLogIn] = useState<boolean>(false);
  const auth = useUser();
  const setAuthUser = (user: User) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("user", JSON.stringify(user));
      router.push("chat");
    }
  };

  if (auth) {
    router.push("chat");
  }

  useEffect(() => setShowLogIn(!auth), [auth]);

  return (
    <div>
      <Head>
        <title>Rust with react chat app</title>
        <meta name="description" content="Rust with react chat app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Login show={showLogIn} setAuth={setAuthUser} />
    </div>
  );
}
