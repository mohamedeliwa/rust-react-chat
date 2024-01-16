"use client";

import Link from "next/link";
import styles from "./Login.module.css";
import { User } from "./Room";
import { useRouter } from "next/navigation";
import user from "@/api/user";

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
    try {
      let userObj = await user.login({ phone });
      setAuth(userObj);
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
