"use client";

import styles from "./Login.module.css";
import Link from "next/link";
import { User } from "./Room";
import { useRouter } from "next/navigation";
import user from "@/api/user";

interface Props {}

const Signup: React.FC<Props> = ({}) => {
  const router = useRouter();

  const setAuth = (user: User) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("user", JSON.stringify(user));
      router.push("chat");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let username = e.target.username.value;
    let phone = e.target.phone.value;
    if (username === "" || phone === "") {
      return;
    }
    try {
      let userObj = await user.create({ username, phone });
      setAuth(userObj);
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
          placeholder="+1111..."
          className={styles.input}
        />
      </div>
      <div className={`${styles.submit} ${styles.form_item}`}>
        <button type="submit">Submit</button>
      </div>
      <div className={`${styles.signIn} ${styles.form_item}`}>
        <p>
          Already have a username? <Link href="/">Sign In</Link>
        </p>
      </div>
    </form>
  );
};

export default Signup;
