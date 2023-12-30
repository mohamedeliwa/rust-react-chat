import { useState } from "react";
import styles from "./Login.module.css";

interface Props {
  show: boolean;
  setAuth: Function;
}

const Login: React.FC<Props> = ({ show, setAuth }) => {
  const [isShowSigIn, setShowSignIn] = useState(false);
  const showSignIn = () => {
    setShowSignIn((prev) => !prev);
  };
  const FormCreateUsername = ({ setAuth }: { setAuth: Function }) => {
    const onCreateUsername = async (e: any) => {
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
      <form action="" className={styles.form} onSubmit={onCreateUsername}>
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
            Already have a username?{" "}
            <button onClick={showSignIn}>Sign In</button>
          </p>
        </div>
      </form>
    );
  };
  const FormSignIn = ({ setAuth }: { setAuth: Function }) => {
    const onSignIn = async (e: any) => {
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
      <form action="" className={styles.form} onSubmit={onSignIn}>
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
            Do not have username? <button onClick={showSignIn}>Create</button>
          </p>
        </div>
      </form>
    );
  };
  return show ? (
    <div className={styles.container}>
      <div className={styles.form_container}>
        <h3 className={styles.title}>
          {isShowSigIn ? "Log in with your phone." : "Create your account."}
        </h3>
        {isShowSigIn ? (
          <FormSignIn setAuth={setAuth} />
        ) : (
          <FormCreateUsername setAuth={setAuth} />
        )}
      </div>
    </div>
  ) : null;
};

export default Login;

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
async function signIn({ phone }: { phone: string }) {
  try {
    const url = "http://localhost:8080/users/phone/" + phone;
    let result = await fetch(url);
    return result.json();
  } catch (e) {
    return Promise.reject(e);
  }
}
