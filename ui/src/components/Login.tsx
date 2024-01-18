"use client";

import Link from "next/link";
import styles from "./Login.module.css";
import userApi from "@/api/user";
import useUser from "@/libs/useUser";
import { FormEvent, useState } from "react";

const Login: React.FC = () => {
  const { setUser } = useUser();
  const [phone, setPhone] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phone === "") {
      return;
    }
    try {
      let user = await userApi.login({ phone });
      setUser(user);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <form action="" className={styles.form} onSubmit={handleSubmit}>
      <div>
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
      <div className={styles.submit}>
        <button type="submit">Submit</button>
      </div>
      <div className={styles.signIn}>
        <p>
          Do not have username?
          <Link href="/signup" passHref>
            Create
          </Link>
        </p>
      </div>
    </form>
  );
};

export default Login;
