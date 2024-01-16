"use client";

import styles from "./Login.module.css";
import Link from "next/link";
import user from "@/api/user";
import useUser from "@/libs/useUser";

interface Props {}

const Signup: React.FC<Props> = ({}) => {
  const { setUser } = useUser();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let username = e.target.username.value;
    let phone = e.target.phone.value;
    if (username === "" || phone === "") {
      return;
    }
    try {
      let userObj = await user.create({ username, phone });
      setUser(userObj);
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
