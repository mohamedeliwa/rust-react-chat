"use client";

import styles from "./Login.module.css";
import Link from "next/link";
import userApi from "@/api/user";
import useUser from "@/libs/useUser";
import { FormEvent, useState } from "react";

interface Props {}

const Signup: React.FC<Props> = ({}) => {
  const { setUser } = useUser();
  const [username, setUsername] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (username === "" || phone === "") {
        return;
      }
      let user = await userApi.create({ username, phone });
      setUser(user);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <form action="" className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.form_item}>
        <label className={styles.label}>Username</label>
        <input
          required
          type="text"
          name="username"
          value={username}
          onChange={(e) => {
            const username = e.target.value;
            setUsername(username);
          }}
          placeholder="John Doe"
          className={styles.input}
        />
      </div>
      <div className={styles.form_item}>
        <label className={styles.label}>Phone</label>
        <input
          required
          type="text"
          name="phone"
          value={phone}
          onChange={(e) => {
            const phone = e.target.value;
            setPhone(phone);
          }}
          placeholder="+1111..."
          className={styles.input}
        />
      </div>
      <div className={`${styles.submit} ${styles.form_item}`}>
        <button type="submit">Submit</button>
      </div>
      <div className={`${styles.signIn} ${styles.form_item}`}>
        <p>
          Already have a username?{" "}
          <Link className={styles.link} href="/">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};

export default Signup;
