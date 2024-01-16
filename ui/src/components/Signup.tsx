"use client";

import styles from "./Login.module.css";
import Link from "next/link";
import { User } from "./Room";
import { useRouter } from "next/navigation";

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
    let res = await createAccount({ username, phone });
    if (res === null) {
      alert("Failed to create account");
      return;
    }
    setAuth(res);
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

async function createAccount({
  username,
  phone,
}: {
  username: string;
  phone: string;
}) {
  try {
    const url = "http://localhost:8080/users/create";
    let result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, phone }),
    });
    return result.json();
  } catch (e) {
    return Promise.reject(e);
  }
}
