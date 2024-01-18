"use client";

import Head from "next/head";
import Login from "../components/Login";
import { useRouter } from "next/navigation";
import useUser from "@/libs/useUser";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

  if (user) {
    router.push("chat");
  }

  return (
    <div>
      <Head>
        <title>Rust with react chat app</title>
        <meta name="description" content="Rust with react chat app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div className={styles.form_container}>
          <h3 className={styles.title}>Login with your phone.</h3>
          <Login />
        </div>
      </div>
    </div>
  );
}
