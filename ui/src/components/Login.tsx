"use client";

import Link from "next/link";
import styles from "./Login.module.css";
import { User } from "./Room";
import { useRouter } from "next/navigation";

interface Props {}

const Login: React.FC<Props> = ({}) => {
  const router = useRouter();

  const setAuth = (user: User) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("user", JSON.stringify(user));
      router.push("chat");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let phone = e.target.phone.value;
    if (phone === "") {
      return;
    }
    let res = await signIn({ phone });
    if (res === null) {
      alert("Failed to create account");
      return;
    }
    if (!res.id) {
      alert(`Phone number not found ${phone}`);
      return;
    }
    setAuth(res);
  };

  return (
    <form action="" className={styles.form} onSubmit={handleSubmit}>
      <div>
        <label className={styles.label}>Phone</label>
        <input
          required
          type="text"
          name="phone"
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

async function signIn({ phone }: { phone: string }) {
  try {
    const url = "http://localhost:8080/users/phone/" + phone;
    let result = await fetch(url);
    return result.json();
  } catch (e) {
    return Promise.reject(e);
  }
}
