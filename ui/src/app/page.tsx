"use client";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import Login from "../components/Login";
import useLocalStorage from "../libs/useLocalStorage";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [showLogIn, setShowLogIn] = useState<boolean>(false);
  const [auth, setAuthUser] = useLocalStorage("user", false);
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
