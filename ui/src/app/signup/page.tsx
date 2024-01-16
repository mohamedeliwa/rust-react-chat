"use client";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import useUser from "@/libs/useUser";
import { User } from "@/components/Room";
import SignupForm from "@/components/Signup";

type Props = {};

const Signup = (props: Props) => {
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
      <div className={styles.container}>
        <div className={styles.form_container}>
          <h3 className={styles.title}>Create your account.</h3>
          <SignupForm setAuth={setAuthUser} />
        </div>
      </div>
    </div>
  );
};

export default Signup;
